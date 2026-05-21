import { useCallback, useEffect } from 'react';
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

export function BuilderLayout() {
  const { addElement, reorderElements, state, toggleChat } = useBuilder();

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

  // Keyboard shortcut: Cmd+K to toggle AI chat
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        toggleChat();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleChat]);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <div className="builder-layout">
        <TopBar />
        <div className="builder-body">
          <ElementsSidebar />
          <Canvas />
          <PropertiesPanel />
        </div>
        <AIChatPanel />
      </div>
    </DndContext>
  );
}
