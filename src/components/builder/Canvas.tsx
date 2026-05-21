import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useBuilder } from './BuilderContext';
import { getElementDefinition } from './element-registry';
import type { BuilderElement } from './types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Trash2, Copy, GripVertical, ChevronUp, ChevronDown, ArrowUpToLine } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

function isContainerElement(element: BuilderElement): boolean {
  return ['container', 'columns', 'grid', 'flex'].includes(element.type);
}

function flattenElementIds(elements: BuilderElement[]): string[] {
  const ids: string[] = [];
  for (const el of elements) {
    ids.push(el.id);
    if (el.children) {
      ids.push(...flattenElementIds(el.children));
    }
  }
  return ids;
}

// =============================================
// SLOT DROP ZONE (built into the slot itself)
// =============================================

function SlotDropZone({ parentId, slotIndex, label }: { parentId: string; slotIndex: number; label: string }) {
  const dropId = `drop-${parentId}-${slotIndex}`;
  const { setNodeRef, isOver } = useDroppable({ id: dropId, data: { parentId, index: slotIndex } });

  return (
    <div
      ref={setNodeRef}
      className={`canvas-el-column-slot ${isOver ? 'slot-drop-active' : ''}`}
    >
      {isOver ? 'Drop here' : label}
    </div>
  );
}

// =============================================
// ELEMENT CONTENT RENDERER
// =============================================

function ElementContent({ element, children }: { element: BuilderElement; children?: React.ReactNode }) {
  const props = element.props;

  switch (element.type) {
    case 'heading': {
      const Tag = ((props.level as string) || 'h2') as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
      const style = { textAlign: ((props.alignment as string) || 'left') as 'left' | 'right' | 'center' | 'justify' };
      return <Tag style={style} className="canvas-el-heading">{(props.text as string) || 'Heading'}</Tag>;
    }
    case 'paragraph':
      return (
        <p className="canvas-el-paragraph" style={{ textAlign: ((props.alignment as string) || 'left') as 'left' | 'right' | 'center' | 'justify' }}>
          {(props.text as string) || 'Paragraph text...'}
        </p>
      );
    case 'input':
    case 'email':
    case 'number':
      return (
        <div className="canvas-el-field">
          {props.label && <label className="canvas-el-label">{(props.label as string)}</label>}
          <input
            type={element.type === 'email' ? 'email' : element.type === 'number' ? 'number' : 'text'}
            placeholder={props.placeholder as string}
            className="canvas-el-input"
            readOnly
          />
        </div>
      );
    case 'textarea':
      return (
        <div className="canvas-el-field">
          {props.label && <label className="canvas-el-label">{(props.label as string)}</label>}
          <textarea
            placeholder={props.placeholder as string}
            rows={(props.rows as number) || 4}
            className="canvas-el-textarea"
            readOnly
          />
        </div>
      );
    case 'select':
      return (
        <div className="canvas-el-field">
          {props.label && <label className="canvas-el-label">{(props.label as string)}</label>}
          <div className="canvas-el-select">
            <span className="canvas-el-select-placeholder">{(props.placeholder as string) || 'Select...'}</span>
            <ChevronDown className="h-4 w-4 opacity-50" />
          </div>
        </div>
      );
    case 'checkbox':
      return (
        <div className="canvas-el-check-row">
          <div className="canvas-el-checkbox" />
          <label className="canvas-el-check-label">{(props.label as string) || 'Checkbox'}</label>
        </div>
      );
    case 'checkbox-group':
      return (
        <div className="canvas-el-field">
          {props.label && <label className="canvas-el-label">{(props.label as string)}</label>}
          <div className="canvas-el-check-group">
            {((props.options as string[]) || ['Option 1', 'Option 2']).map((opt, i) => (
              <div key={i} className="canvas-el-check-row">
                <div className="canvas-el-checkbox" />
                <span>{opt}</span>
              </div>
            ))}
          </div>
        </div>
      );
    case 'radio-group':
      return (
        <div className="canvas-el-field">
          {props.label && <label className="canvas-el-label">{(props.label as string)}</label>}
          <div className="canvas-el-check-group">
            {((props.options as string[]) || ['Option 1', 'Option 2']).map((opt, i) => (
              <div key={i} className="canvas-el-check-row">
                <div className="canvas-el-radio" />
                <div className="canvas-el-radio-info">
                  <span>{opt}</span>
                  <span className="canvas-el-radio-desc">{opt} Description</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    case 'switch':
      return (
        <div className="canvas-el-check-row">
          <div className="canvas-el-switch">
            <div className="canvas-el-switch-thumb" />
          </div>
          <label className="canvas-el-check-label">{(props.label as string) || 'Switch'}</label>
        </div>
      );
    case 'date-picker':
      return (
        <div className="canvas-el-field">
          {props.label && <label className="canvas-el-label">{(props.label as string)}</label>}
          <div className="canvas-el-select">
            <span className="canvas-el-select-placeholder">{(props.placeholder as string) || 'Pick a date...'}</span>
          </div>
        </div>
      );
    case 'file-upload':
      return (
        <div className="canvas-el-field">
          {props.label && <label className="canvas-el-label">{(props.label as string)}</label>}
          <div className="canvas-el-upload">
            <span>Drop files here or click to upload</span>
          </div>
        </div>
      );
    case 'button':
    case 'submit':
    case 'reset':
      return (
        <button className={`canvas-el-button canvas-el-button--${props.variant || 'default'}`}>
          {(props.text as string) || element.label}
        </button>
      );
    case 'image':
      return (
        <div className="canvas-el-image-placeholder">
          <span>Image Placeholder</span>
        </div>
      );
    case 'spacer':
      return <div className="canvas-el-spacer" style={{ height: `${props.height || 32}px` }} />;
    case 'divider':
      return <hr className="canvas-el-divider" />;
    case 'container':
      return (
        <div className="canvas-el-container">
          <span className="canvas-el-container-label" />
          {children}
        </div>
      );
    case 'grid':
      return (
        <div
          className="canvas-el-columns"
          style={{
            gridTemplateColumns: `repeat(${props.columns || 3}, 1fr)`,
            gridTemplateRows: `repeat(${props.rows || 2}, 1fr)`,
            gap: `${props.gap || 16}px`,
          }}
        >
          {children}
        </div>
      );
    case 'columns':
      return (
        <div className="canvas-el-columns" style={{ gridTemplateColumns: `repeat(${props.columns || 2}, 1fr)`, gap: `${props.gap || 16}px` }}>
          {children}
        </div>
      );
    case 'flex':
      return (
        <div className="canvas-el-flex" style={{ display: 'flex', flexDirection: props.direction as 'row' | 'column' || 'row', gap: `${props.gap || 16}px`, alignItems: 'center', justifyContent: 'space-between', padding: '16px', border: '1px dashed var(--border)', borderRadius: '8px' }}>
          {children}
        </div>
      );
    default:
      return <div className="canvas-el-unknown">Unknown element: {element.type}</div>;
  }
}

// =============================================
// CONTAINER SLOTS RENDERER (with children + drop zones)
// =============================================

function ContainerSlots({ element }: { element: BuilderElement }) {
  const children = element.children || [];
  const props = element.props;

  if (element.type === 'container') {
    if (children.length > 0) {
      return (
        <SortableContext items={children.map((c) => c.id)} strategy={verticalListSortingStrategy}>
          <div className="canvas-container-children">
            {children.map((child) => (
              <SortableCanvasElement key={child.id} element={child} />
            ))}
          </div>
        </SortableContext>
      );
    }
    return <SlotDropZone parentId={element.id} slotIndex={0} label="" />;
  }

  if (element.type === 'grid') {
    const cols = (props.columns as number) || 3;
    const rows = (props.rows as number) || 2;
    const totalSlots = cols * rows;

    return (
      <SortableContext items={children.map((c) => c.id)} strategy={verticalListSortingStrategy}>
        {Array.from({ length: totalSlots }).map((_, i) => {
          const child = children[i];
          if (child) {
            return <SortableCanvasElement key={child.id} element={child} />;
          }
          return <SlotDropZone key={`slot-${i}`} parentId={element.id} slotIndex={i} label={`${i + 1}`} />;
        })}
      </SortableContext>
    );
  }

  if (element.type === 'columns') {
    const cols = (props.columns as number) || 2;

    return (
      <SortableContext items={children.map((c) => c.id)} strategy={verticalListSortingStrategy}>
        {Array.from({ length: cols }).map((_, i) => {
          const child = children[i];
          if (child) {
            return <SortableCanvasElement key={child.id} element={child} />;
          }
          return <SlotDropZone key={`slot-${i}`} parentId={element.id} slotIndex={i} label={`${i + 1}`} />;
        })}
      </SortableContext>
    );
  }

  if (element.type === 'flex') {
    return (
      <SortableContext items={children.map((c) => c.id)} strategy={verticalListSortingStrategy}>
        {Array.from({ length: 2 }).map((_, i) => {
          const child = children[i];
          if (child) {
            return <SortableCanvasElement key={child.id} element={child} />;
          }
          return <SlotDropZone key={`slot-${i}`} parentId={element.id} slotIndex={i} label={`${i + 1}`} />;
        })}
      </SortableContext>
    );
  }

  return null;
}

// =============================================
// SORTABLE ELEMENT (wrapper with toolbar)
// =============================================

function SortableCanvasElement({ element }: { element: BuilderElement }) {
  const { state, selectElement, removeElement, duplicateElement, moveElementUp, moveElementDown, promoteElement, getElementParent } = useBuilder();
  const isSelected = state.selectedElementId === element.id;
  const definition = getElementDefinition(element.type);
  const parent = getElementParent(element.id);
  const isContainer = isContainerElement(element);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: element.id, data: { type: element.type } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 50 : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`canvas-element ${isSelected ? 'selected' : ''} ${isDragging ? 'dragging' : ''} ${isContainer ? 'is-container' : ''}`}
      onClick={(e) => { e.stopPropagation(); selectElement(element.id); }}
    >
      {/* Toolbar */}
      {isSelected && (
        <div className="canvas-element-toolbar">
          <span className="canvas-element-type-label">{definition?.label || element.type}</span>
          <div className="canvas-element-actions">
            {parent && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <button onClick={(e) => { e.stopPropagation(); promoteElement(element.id); }} className="canvas-action-btn">
                    <ArrowUpToLine className="h-3.5 w-3.5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top">Promote to parent</TooltipContent>
              </Tooltip>
            )}
            <Tooltip>
              <TooltipTrigger asChild>
                <button onClick={(e) => { e.stopPropagation(); moveElementUp(element.id); }} className="canvas-action-btn">
                  <ChevronUp className="h-3.5 w-3.5" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="top">Move Up</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <button onClick={(e) => { e.stopPropagation(); moveElementDown(element.id); }} className="canvas-action-btn">
                  <ChevronDown className="h-3.5 w-3.5" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="top">Move Down</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <button onClick={(e) => { e.stopPropagation(); duplicateElement(element.id); }} className="canvas-action-btn">
                  <Copy className="h-3.5 w-3.5" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="top">Duplicate</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <button onClick={(e) => { e.stopPropagation(); removeElement(element.id); }} className="canvas-action-btn destructive">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="top">Delete</TooltipContent>
            </Tooltip>
          </div>
        </div>
      )}

      {/* Drag handle */}
      <div className="canvas-element-drag-handle" {...attributes} {...listeners}>
        <GripVertical className="h-4 w-4" />
      </div>

      {/* Content */}
      <div className="canvas-element-content">
        {isContainer ? (
          <ElementContent element={element}>
            <ContainerSlots element={element} />
          </ElementContent>
        ) : (
          <ElementContent element={element} />
        )}
      </div>
    </div>
  );
}

// =============================================
// CANVAS
// =============================================

export function Canvas() {
  const { state, selectElement } = useBuilder();
  const { setNodeRef, isOver } = useDroppable({
    id: 'canvas-drop-zone',
    data: { parentId: null },
  });

  const canvasWidth =
    state.activeBreakpoint === 'desktop'
      ? '100%'
      : state.activeBreakpoint === 'tablet'
        ? '768px'
        : '375px';

  const allIds = flattenElementIds(state.elements);

  return (
    <main className="builder-canvas" onClick={() => selectElement(null)}>
      <ScrollArea className="h-full">
        <div className="canvas-viewport" style={{ transition: 'all 0.3s ease', padding: '24px', display: 'flex', justifyContent: 'center' }}>
          <div
            ref={setNodeRef}
            className={`canvas-form-area ${isOver ? 'drop-active' : ''} ${state.elements.length === 0 ? 'empty' : ''}`}
            style={{ width: canvasWidth, maxWidth: '100%', transition: 'width 0.3s ease', margin: '0 auto', background: 'var(--card)', borderRadius: '12px', boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }}
          >
            {state.elements.length === 0 ? (
              <div className="canvas-empty-state">
                <div className="canvas-empty-icon">
                  <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                    <rect x="4" y="4" width="40" height="40" rx="8" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 4" opacity="0.4" />
                    <path d="M24 16V32M16 24H32" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
                  </svg>
                </div>
                <h3 className="canvas-empty-title">Start Building</h3>
                <p className="canvas-empty-desc">
                  Drag elements from the left panel or double-click to add them.<br />
                  You can also use the AI Chat to describe what you want to build.
                </p>
              </div>
            ) : (
              <SortableContext items={allIds} strategy={verticalListSortingStrategy}>
                {state.elements.map((element) => (
                  <SortableCanvasElement key={element.id} element={element} />
                ))}
              </SortableContext>
            )}
          </div>
        </div>
      </ScrollArea>
    </main>
  );
}
