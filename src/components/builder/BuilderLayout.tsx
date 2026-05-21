import { useCallback } from 'react';
import {
  DndContext,
  useSensor,
  useSensors,
  PointerSensor,
  type DragEndEvent,
  closestCenter,
} from '@dnd-kit/core';
import { useBuilder } from './BuilderContext';
import { TopBar } from './TopBar';
import { ElementsSidebar } from './ElementsSidebar';
import { Canvas } from './Canvas';
import { PropertiesPanel } from './PropertiesPanel';
import { AIChatPanel } from './AIChatPanel';
import type { ElementType } from './types';
import { ChevronLeft } from 'lucide-react';

export function BuilderLayout() {
  const { addElement, reorderElements, state, selectElement, moveElementTo } = useBuilder();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over) return;

      const activeData = active.data.current;
      const overData = over.data.current;

      // Case 1: Sidebar -> canvas root
      if (activeData?.source === 'sidebar' && over.id === 'canvas-drop-zone') {
        addElement(activeData.elementType as ElementType);
        return;
      }

      // Case 2: Sidebar -> container slot drop zone
      if (activeData?.source === 'sidebar' && typeof over.id === 'string' && over.id.startsWith('drop-')) {
        const parentId = overData?.parentId as string;
        const slotIndex = overData?.index as number | undefined;
        if (parentId) {
          addElement(activeData.elementType as ElementType, parentId, slotIndex);
        }
        return;
      }

      // Case 3: Canvas element -> container slot drop zone (move into container)
      if (typeof over.id === 'string' && over.id.startsWith('drop-')) {
        const parentId = overData?.parentId as string;
        const slotIndex = overData?.index as number | undefined;
        const activeId = active.id as string;
        if (parentId) {
          moveElementTo(activeId, parentId, slotIndex ?? 0);
        }
        return;
      }

      // Case 4: Canvas element -> canvas root (reorder when over is a root element or canvas)
      if (over.id === 'canvas-drop-zone') {
        // Dragging canvas element to root area - move to end of root
        const activeId = active.id as string;
        moveElementTo(activeId, null, state.elements.length);
        return;
      }

      // Case 5: Reordering canvas elements (over another element)
      if (active.id !== over.id) {
        const overId = over.id as string;

        // Check if over is a root element
        const rootIndex = state.elements.findIndex((el) => el.id === overId);
        if (rootIndex !== -1) {
          // Check if active is a root element
          const activeRootIndex = state.elements.findIndex((el) => el.id === active.id);
          if (activeRootIndex !== -1) {
            // Reorder at root level
            reorderElements(null, activeRootIndex, rootIndex);
          }
          return;
        }

        // Otherwise, both are inside some container - handled by sortable context
        // The SortableContext handles reordering within the same container automatically
      }
    },
    [addElement, reorderElements, state.elements, moveElementTo]
  );

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <div className="builder-layout">
        <aside className="left-sidebar">
          {state.selectedElementId ? (
            <div className="sidebar-panel-container">
              <div className="sidebar-panel-header">
                <button className="back-to-elements-btn" onClick={() => selectElement(null)}>
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Back to Elements
                </button>
              </div>
              <PropertiesPanel />
            </div>
          ) : (
            <ElementsSidebar />
          )}
        </aside>

        <div className="center-column">
          <TopBar />
          <Canvas />
        </div>

        <AIChatPanel />
      </div>
    </DndContext>
  );
}
