import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useBuilder } from './BuilderContext';
import { getElementDefinition } from './element-registry';
import type { BuilderElement } from './types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Trash2, Copy, GripVertical, ChevronUp, ChevronDown } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

function CanvasElementRenderer({ element }: { element: BuilderElement }) {
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
          <span className="canvas-el-container-label">Container</span>
        </div>
      );
    case 'grid':
    case 'columns':
      return (
        <div className="canvas-el-columns" style={{ gridTemplateColumns: `repeat(${props.columns || 2}, 1fr)`, gap: `${props.gap || 16}px` }}>
          {Array.from({ length: (props.columns as number) || 2 }).map((_, i) => (
            <div key={i} className="canvas-el-column-slot">
              Slot {i + 1}
            </div>
          ))}
        </div>
      );
    case 'flex':
      return (
        <div className="canvas-el-flex" style={{ display: 'flex', flexDirection: props.direction as 'row' | 'column' || 'row', gap: `${props.gap || 16}px`, alignItems: 'center', justifyContent: 'space-between', padding: '16px', border: '1px dashed var(--border)', borderRadius: '8px' }}>
          <div className="canvas-el-column-slot">Flex Item 1</div>
          <div className="canvas-el-column-slot">Flex Item 2</div>
        </div>
      );
    default:
      return <div className="canvas-el-unknown">Unknown element: {element.type}</div>;
  }
}

function SortableCanvasElement({ element }: { element: BuilderElement }) {
  const { state, selectElement, removeElement, duplicateElement, moveElementUp, moveElementDown } = useBuilder();
  const isSelected = state.selectedElementId === element.id;
  const definition = getElementDefinition(element.type);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: element.id });

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
      className={`canvas-element ${isSelected ? 'selected' : ''} ${isDragging ? 'dragging' : ''}`}
      onClick={(e) => { e.stopPropagation(); selectElement(element.id); }}
    >
      {isSelected && (
        <div className="canvas-element-toolbar">
          <span className="canvas-element-type-label">{definition?.label || element.type}</span>
          <div className="canvas-element-actions">
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

      <div className="canvas-element-drag-handle" {...attributes} {...listeners}>
        <GripVertical className="h-4 w-4" />
      </div>

      <div className="canvas-element-content">
        <CanvasElementRenderer element={element} />
      </div>
    </div>
  );
}

export function Canvas() {
  const { state, selectElement } = useBuilder();
  const { setNodeRef, isOver } = useDroppable({ id: 'canvas-drop-zone' });

  const canvasWidth = state.activeBreakpoint === 'desktop' ? '100%' :
                      state.activeBreakpoint === 'tablet' ? '768px' : '375px';

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
              <SortableContext items={state.elements.map((el) => el.id)} strategy={verticalListSortingStrategy}>
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
