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
  const { addElement, reorderElements, state, selectElement } = useBuilder();

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

      // Dragging from sidebar to canvas
      if (activeData?.source === 'sidebar' && over.id === 'canvas-drop-zone') {
        addElement(activeData.elementType as ElementType);
        return;
      }

      // Reordering within canvas
      if (active.id !== over.id) {
        const oldIndex = state.elements.findIndex((el) => el.id === active.id);
        const newIndex = state.elements.findIndex((el) => el.id === over.id);
        if (oldIndex !== -1 && newIndex !== -1) {
          reorderElements(oldIndex, newIndex);
        }
      }
    },
    [addElement, reorderElements, state.elements]
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
