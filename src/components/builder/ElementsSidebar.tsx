import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { useBuilder } from './BuilderContext';
import { elementCategories } from './element-registry';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import type { ElementType } from './types';
import {
  Square,
  Columns3,
  SeparatorHorizontal,
  Minus,
  Type,
  AlignLeft,
  ImageIcon,
  TextCursorInput,
  Mail,
  Hash,
  AlignJustify,
  ChevronDown,
  CheckSquare,
  ListChecks,
  CircleDot,
  ToggleLeft,
  Calendar,
  Upload,
  MousePointerClick,
  Send,
  RotateCcw,
  GripVertical,
  User,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

const iconMap: Record<string, LucideIcon> = {
  Square, Columns3, SeparatorHorizontal, Minus, Type, AlignLeft, ImageIcon,
  TextCursorInput, Mail, Hash, AlignJustify, ChevronDown, CheckSquare,
  ListChecks, CircleDot, ToggleLeft, Calendar, Upload, MousePointerClick,
  Send, RotateCcw,
};

function DraggableElement({ type, label, description, icon, isNew }: {
  type: ElementType;
  label: string;
  description: string;
  icon: string;
  isNew?: boolean;
}) {
  const { addElement } = useBuilder();
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `sidebar-${type}`,
    data: { source: 'sidebar', elementType: type },
  });

  const Icon = iconMap[icon] || Square;
  const style = transform ? {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : undefined,
  } : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`sidebar-element ${isDragging ? 'dragging' : ''}`}
      onDoubleClick={() => addElement(type)}
      role="button"
      tabIndex={0}
    >
      <div className="sidebar-element-icon">
        <Icon className="h-4 w-4" />
      </div>
      <div className="sidebar-element-info">
        <span className="sidebar-element-label">{label}</span>
        <span className="sidebar-element-desc">{description}</span>
      </div>
      {isNew && (
        <Badge variant="secondary" className="sidebar-element-badge">
          New
        </Badge>
      )}
      <GripVertical className="sidebar-element-grip h-3.5 w-3.5" />
    </div>
  );
}

export function ElementsSidebar() {
  return (
    <aside className="elements-sidebar">
      <ScrollArea className="h-full">
        <div className="sidebar-content">
          {elementCategories.map((category) => (
            <div key={category.name} className="sidebar-category">
              <h3 className="sidebar-category-title">{category.name}</h3>
              <div className="sidebar-category-elements">
                {category.elements.map((element) => (
                  <DraggableElement
                    key={element.type}
                    type={element.type}
                    label={element.label}
                    description={element.description}
                    icon={element.icon}
                    isNew={element.isNew}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="sidebar-user">
          <div className="sidebar-user-avatar">
            <User className="h-4 w-4" />
          </div>
          <div className="sidebar-user-info">
            <span className="sidebar-user-name">Builder User</span>
            <span className="sidebar-user-email">user@astrive.io</span>
          </div>
        </div>
      </ScrollArea>
    </aside>
  );
}
