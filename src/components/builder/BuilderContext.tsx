import { createContext, useContext, useReducer, useCallback, type ReactNode } from 'react';
import type { BuilderElement, BuilderState, ChatMessage, ElementType } from './types';
import { getElementDefinition } from './element-registry';

type BuilderAction =
  | { type: 'ADD_ELEMENT'; payload: { elementType: ElementType; parentId?: string; index?: number } }
  | { type: 'REMOVE_ELEMENT'; payload: { id: string } }
  | { type: 'SELECT_ELEMENT'; payload: { id: string | null } }
  | { type: 'UPDATE_ELEMENT_PROPS'; payload: { id: string; props: Record<string, unknown> } }
  | { type: 'REORDER_ELEMENTS'; payload: { parentId: string | null; oldIndex: number; newIndex: number } }
  | { type: 'ADD_CHAT_MESSAGE'; payload: ChatMessage }
  | { type: 'SET_BREAKPOINT'; payload: 'desktop' | 'tablet' | 'mobile' }
  | { type: 'DUPLICATE_ELEMENT'; payload: { id: string } }
  | { type: 'MOVE_ELEMENT_UP'; payload: { id: string } }
  | { type: 'MOVE_ELEMENT_DOWN'; payload: { id: string } }
  | { type: 'PROMOTE_ELEMENT'; payload: { id: string } }
  | { type: 'MOVE_ELEMENT_TO'; payload: { id: string; parentId: string | null; index: number } };

let nextId = 1;
function generateId(): string {
  return `el_${Date.now()}_${nextId++}`;
}

const initialState: BuilderState = {
  elements: [],
  selectedElementId: null,
  chatMessages: [
    {
      id: 'welcome',
      role: 'assistant',
      content: 'Hey! I\'m your AI builder assistant. Tell me what you want to build and I\'ll help you create it. Try something like "Create a contact form with name, email, and message fields".',
      timestamp: new Date(),
    },
  ],
  activeBreakpoint: 'desktop',
};

function findElementById(elements: BuilderElement[], id: string): BuilderElement | undefined {
  for (const el of elements) {
    if (el.id === id) return el;
    if (el.children) {
      const found = findElementById(el.children, id);
      if (found) return found;
    }
  }
  return undefined;
}

function findParentAndIndex(
  elements: BuilderElement[],
  id: string,
): { parent: BuilderElement[]; index: number; parentElement: BuilderElement | null } | null {
  for (let i = 0; i < elements.length; i++) {
    if (elements[i].id === id) {
      return { parent: elements, index: i, parentElement: null };
    }
    if (elements[i].children) {
      const result = findParentAndIndex(elements[i].children!, id);
      if (result) {
        return result.parentElement !== null
          ? result
          : { parent: elements[i].children!, index: result.index, parentElement: elements[i] };
      }
    }
  }
  return null;
}

function mapElementTree(
  elements: BuilderElement[],
  id: string,
  updater: (el: BuilderElement) => BuilderElement,
): BuilderElement[] {
  return elements.map((el) => {
    if (el.id === id) return updater(el);
    if (el.children) {
      return { ...el, children: mapElementTree(el.children, id, updater) };
    }
    return el;
  });
}

function removeFromTree(elements: BuilderElement[], id: string): BuilderElement[] {
  return elements
    .filter((el) => el.id !== id)
    .map((el) => {
      if (el.children) {
        return { ...el, children: removeFromTree(el.children, id) };
      }
      return el;
    });
}

function builderReducer(state: BuilderState, action: BuilderAction): BuilderState {
  switch (action.type) {
    case 'ADD_ELEMENT': {
      const definition = getElementDefinition(action.payload.elementType);
      if (!definition) return state;
      const newElement: BuilderElement = {
        id: generateId(),
        type: action.payload.elementType,
        label: definition.label,
        props: { ...definition.defaultProps },
      };

      if (action.payload.parentId) {
        const elements = mapElementTree(state.elements, action.payload.parentId, (parent) => {
          const children = [...(parent.children || [])];
          if (action.payload.index !== undefined) {
            children.splice(action.payload.index, 0, newElement);
          } else {
            children.push(newElement);
          }
          return { ...parent, children };
        });
        return { ...state, elements, selectedElementId: newElement.id };
      }

      const elements = [...state.elements];
      if (action.payload.index !== undefined) {
        elements.splice(action.payload.index, 0, newElement);
      } else {
        elements.push(newElement);
      }
      return { ...state, elements, selectedElementId: newElement.id };
    }

    case 'REMOVE_ELEMENT': {
      const elements = removeFromTree(state.elements, action.payload.id);
      return {
        ...state,
        elements,
        selectedElementId:
          state.selectedElementId === action.payload.id ? null : state.selectedElementId,
      };
    }

    case 'SELECT_ELEMENT':
      return { ...state, selectedElementId: action.payload.id };

    case 'UPDATE_ELEMENT_PROPS': {
      const elements = mapElementTree(state.elements, action.payload.id, (el) => ({
        ...el,
        props: { ...el.props, ...action.payload.props },
      }));
      return { ...state, elements };
    }

    case 'REORDER_ELEMENTS': {
      const { parentId, oldIndex, newIndex } = action.payload;

      if (parentId) {
        const elements = mapElementTree(state.elements, parentId, (parent) => {
          const children = [...(parent.children || [])];
          const [removed] = children.splice(oldIndex, 1);
          children.splice(newIndex, 0, removed);
          return { ...parent, children };
        });
        return { ...state, elements };
      }

      const elements = [...state.elements];
      const [removed] = elements.splice(oldIndex, 1);
      elements.splice(newIndex, 0, removed);
      return { ...state, elements };
    }

    case 'DUPLICATE_ELEMENT': {
      const source = findElementById(state.elements, action.payload.id);
      if (!source) return state;

      const duplicate: BuilderElement = {
        ...source,
        id: generateId(),
        props: { ...source.props },
        children: source.children
          ? source.children.map((child) => ({ ...child, id: generateId() }))
          : undefined,
      };

      const location = findParentAndIndex(state.elements, action.payload.id);
      if (!location) return state;

      const parentArray = location.parent;
      const insertIndex = location.index + 1;
      const newParentArray = [...parentArray];
      newParentArray.splice(insertIndex, 0, duplicate);

      if (location.parentElement) {
        const elements = mapElementTree(state.elements, location.parentElement.id, (parent) => ({
          ...parent,
          children: newParentArray,
        }));
        return { ...state, elements, selectedElementId: duplicate.id };
      }

      return { ...state, elements: newParentArray, selectedElementId: duplicate.id };
    }

    case 'MOVE_ELEMENT_UP': {
      const location = findParentAndIndex(state.elements, action.payload.id);
      if (!location || location.index <= 0) return state;

      const parentArray = location.parent;
      const newArray = [...parentArray];
      [newArray[location.index - 1], newArray[location.index]] = [
        newArray[location.index],
        newArray[location.index - 1],
      ];

      if (location.parentElement) {
        const elements = mapElementTree(state.elements, location.parentElement.id, (parent) => ({
          ...parent,
          children: newArray,
        }));
        return { ...state, elements };
      }

      return { ...state, elements: newArray };
    }

    case 'MOVE_ELEMENT_DOWN': {
      const location = findParentAndIndex(state.elements, action.payload.id);
      if (!location || location.index >= location.parent.length - 1) return state;

      const parentArray = location.parent;
      const newArray = [...parentArray];
      [newArray[location.index], newArray[location.index + 1]] = [
        newArray[location.index + 1],
        newArray[location.index],
      ];

      if (location.parentElement) {
        const elements = mapElementTree(state.elements, location.parentElement.id, (parent) => ({
          ...parent,
          children: newArray,
        }));
        return { ...state, elements };
      }

      return { ...state, elements: newArray };
    }

    case 'PROMOTE_ELEMENT': {
      const location = findParentAndIndex(state.elements, action.payload.id);
      if (!location || !location.parentElement) return state;

      const childArray = [...location.parent];
      const [element] = childArray.splice(location.index, 1);

      // Find grandparent to insert after the parent
      const grandParentLoc = findParentAndIndex(state.elements, location.parentElement.id);
      if (!grandParentLoc) return state;

      const grandParentArray = grandParentLoc.parent;
      const parentIndex = grandParentLoc.index;
      const newGrandParentArray = [...grandParentArray];

      // Replace parent element with updated children (minus the promoted one)
      const parentWithoutChild = {
        ...location.parentElement,
        children: childArray.length > 0 ? childArray : undefined,
      };
      newGrandParentArray[parentIndex] = parentWithoutChild;

      // Insert promoted element after the parent
      newGrandParentArray.splice(parentIndex + 1, 0, element);

      if (grandParentLoc.parentElement) {
        const elements = mapElementTree(
          state.elements,
          grandParentLoc.parentElement.id,
          (parent) => ({ ...parent, children: newGrandParentArray }),
        );
        return { ...state, elements, selectedElementId: element.id };
      }

      return { ...state, elements: newGrandParentArray, selectedElementId: element.id };
    }

    case 'MOVE_ELEMENT_TO': {
      const { id, parentId, index } = action.payload;

      // Remove element from current position
      const currentLoc = findParentAndIndex(state.elements, id);
      if (!currentLoc) return state;

      const currentParentArray = [...currentLoc.parent];
      const [element] = currentParentArray.splice(currentLoc.index, 1);

      // Build state after removal
      let newElements: BuilderElement[];
      if (currentLoc.parentElement) {
        newElements = mapElementTree(state.elements, currentLoc.parentElement.id, (parent) => ({
          ...parent,
          children: currentParentArray.length > 0 ? currentParentArray : undefined,
        }));
      } else {
        newElements = currentParentArray;
      }

      // Insert into target
      if (parentId) {
        newElements = mapElementTree(newElements, parentId, (parent) => {
          const children = [...(parent.children || [])];
          children.splice(index, 0, element);
          return { ...parent, children };
        });
      } else {
        const targetArray = [...newElements];
        targetArray.splice(index, 0, element);
        newElements = targetArray;
      }

      return { ...state, elements: newElements, selectedElementId: element.id };
    }

    case 'ADD_CHAT_MESSAGE':
      return { ...state, chatMessages: [...state.chatMessages, action.payload] };

    case 'SET_BREAKPOINT':
      return { ...state, activeBreakpoint: action.payload };

    default:
      return state;
  }
}

interface BuilderContextType {
  state: BuilderState;
  dispatch: React.Dispatch<BuilderAction>;
  addElement: (type: ElementType, parentId?: string, index?: number) => void;
  removeElement: (id: string) => void;
  selectElement: (id: string | null) => void;
  updateElementProps: (id: string, props: Record<string, unknown>) => void;
  reorderElements: (parentId: string | null, oldIndex: number, newIndex: number) => void;
  duplicateElement: (id: string) => void;
  moveElementUp: (id: string) => void;
  moveElementDown: (id: string) => void;
  promoteElement: (id: string) => void;
  moveElementTo: (id: string, parentId: string | null, index: number) => void;
  setBreakpoint: (breakpoint: 'desktop' | 'tablet' | 'mobile') => void;
  sendChatMessage: (content: string) => void;
  getSelectedElement: () => BuilderElement | undefined;
  getElementParent: (id: string) => BuilderElement | null;
}

const BuilderContext = createContext<BuilderContextType | null>(null);

export function BuilderProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(builderReducer, initialState);

  const addElement = useCallback(
    (type: ElementType, parentId?: string, index?: number) => {
      dispatch({
        type: 'ADD_ELEMENT',
        payload: { elementType: type, parentId, index },
      });
    },
    [],
  );

  const removeElement = useCallback((id: string) => {
    dispatch({ type: 'REMOVE_ELEMENT', payload: { id } });
  }, []);

  const selectElement = useCallback((id: string | null) => {
    dispatch({ type: 'SELECT_ELEMENT', payload: { id } });
  }, []);

  const updateElementProps = useCallback((id: string, props: Record<string, unknown>) => {
    dispatch({ type: 'UPDATE_ELEMENT_PROPS', payload: { id, props } });
  }, []);

  const reorderElements = useCallback(
    (parentId: string | null, oldIndex: number, newIndex: number) => {
      dispatch({
        type: 'REORDER_ELEMENTS',
        payload: { parentId, oldIndex, newIndex },
      });
    },
    [],
  );

  const duplicateElement = useCallback((id: string) => {
    dispatch({ type: 'DUPLICATE_ELEMENT', payload: { id } });
  }, []);

  const moveElementUp = useCallback((id: string) => {
    dispatch({ type: 'MOVE_ELEMENT_UP', payload: { id } });
  }, []);

  const moveElementDown = useCallback((id: string) => {
    dispatch({ type: 'MOVE_ELEMENT_DOWN', payload: { id } });
  }, []);

  const promoteElement = useCallback((id: string) => {
    dispatch({ type: 'PROMOTE_ELEMENT', payload: { id } });
  }, []);

  const moveElementTo = useCallback(
    (id: string, parentId: string | null, index: number) => {
      dispatch({ type: 'MOVE_ELEMENT_TO', payload: { id, parentId, index } });
    },
    [],
  );

  const setBreakpoint = useCallback((breakpoint: 'desktop' | 'tablet' | 'mobile') => {
    dispatch({ type: 'SET_BREAKPOINT', payload: breakpoint });
  }, []);

  const sendChatMessage = useCallback((content: string) => {
    const userMessage: ChatMessage = {
      id: `msg_${Date.now()}`,
      role: 'user',
      content,
      timestamp: new Date(),
    };
    dispatch({ type: 'ADD_CHAT_MESSAGE', payload: userMessage });

    setTimeout(() => {
      const aiMessage: ChatMessage = {
        id: `msg_${Date.now()}_ai`,
        role: 'assistant',
        content: getAIResponse(content),
        timestamp: new Date(),
      };
      dispatch({ type: 'ADD_CHAT_MESSAGE', payload: aiMessage });
    }, 800);
  }, []);

  const getSelectedElement = useCallback(() => {
    if (!state.selectedElementId) return undefined;
    return findElementById(state.elements, state.selectedElementId);
  }, [state.selectedElementId, state.elements]);

  const getElementParent = useCallback(
    (id: string): BuilderElement | null => {
      const loc = findParentAndIndex(state.elements, id);
      return loc?.parentElement || null;
    },
    [state.elements],
  );

  return (
    <BuilderContext.Provider
      value={{
        state,
        dispatch,
        addElement,
        removeElement,
        selectElement,
        updateElementProps,
        reorderElements,
        duplicateElement,
        moveElementUp,
        moveElementDown,
        promoteElement,
        moveElementTo,
        setBreakpoint,
        sendChatMessage,
        getSelectedElement,
        getElementParent,
      }}
    >
      {children}
    </BuilderContext.Provider>
  );
}

export function useBuilder() {
  const context = useContext(BuilderContext);
  if (!context) throw new Error('useBuilder must be used within BuilderProvider');
  return context;
}

function getAIResponse(userMessage: string): string {
  const lower = userMessage.toLowerCase();
  if (lower.includes('form') || lower.includes('contact')) {
    return 'Great idea! I\'d suggest starting with a Heading, then adding Input fields for Name and Email, a Text Area for the message, and finishing with a Submit button. You can drag these elements from the left panel, or I can help you plan the structure further.';
  }
  if (lower.includes('button')) {
    return 'You can add buttons from the \'Buttons\' section in the left panel. There are three types: Button (general purpose), Submit (for forms), and Reset (to clear form data). Each can be customized with different variants and sizes in the properties panel.';
  }
  if (lower.includes('layout') || lower.includes('column')) {
    return 'For layout, try using the Container element to wrap your content, and Columns to create multi-column layouts. You can also use Spacer and Divider elements to control spacing between sections.';
  }
  if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey')) {
    return 'Hey there! I\'m here to help you build your page. What would you like to create? You can describe a layout, form, or any component and I\'ll guide you through building it.';
  }
  return 'I can help you with that! Try dragging elements from the left sidebar to the canvas, or describe what you\'d like to build and I\'ll suggest the right components. You can also select any element on the canvas to edit its properties in the right panel.';
}
