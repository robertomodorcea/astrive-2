import { createContext, useContext, useReducer, useCallback, type ReactNode } from 'react';
import type { BuilderElement, BuilderState, ChatMessage, ElementType } from './types';
import { getElementDefinition } from './element-registry';

type BuilderAction =
  | { type: 'ADD_ELEMENT'; payload: { elementType: ElementType; index?: number } }
  | { type: 'REMOVE_ELEMENT'; payload: { id: string } }
  | { type: 'SELECT_ELEMENT'; payload: { id: string | null } }
  | { type: 'UPDATE_ELEMENT_PROPS'; payload: { id: string; props: Record<string, unknown> } }
  | { type: 'REORDER_ELEMENTS'; payload: { oldIndex: number; newIndex: number } }
  | { type: 'ADD_CHAT_MESSAGE'; payload: ChatMessage }
  | { type: 'SET_BREAKPOINT'; payload: 'desktop' | 'tablet' | 'mobile' }
  | { type: 'DUPLICATE_ELEMENT'; payload: { id: string } }
  | { type: 'MOVE_ELEMENT_UP'; payload: { id: string } }
  | { type: 'MOVE_ELEMENT_DOWN'; payload: { id: string } };

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
      const elements = [...state.elements];
      if (action.payload.index !== undefined) {
        elements.splice(action.payload.index, 0, newElement);
      } else {
        elements.push(newElement);
      }
      return { ...state, elements, selectedElementId: newElement.id };
    }
    case 'REMOVE_ELEMENT': {
      return {
        ...state,
        elements: state.elements.filter((el) => el.id !== action.payload.id),
        selectedElementId: state.selectedElementId === action.payload.id ? null : state.selectedElementId,
      };
    }
    case 'SELECT_ELEMENT': {
      return { ...state, selectedElementId: action.payload.id };
    }
    case 'UPDATE_ELEMENT_PROPS': {
      return {
        ...state,
        elements: state.elements.map((el) =>
          el.id === action.payload.id ? { ...el, props: { ...el.props, ...action.payload.props } } : el
        ),
      };
    }
    case 'REORDER_ELEMENTS': {
      const { oldIndex, newIndex } = action.payload;
      const elements = [...state.elements];
      const [removed] = elements.splice(oldIndex, 1);
      elements.splice(newIndex, 0, removed);
      return { ...state, elements };
    }
    case 'DUPLICATE_ELEMENT': {
      const sourceIndex = state.elements.findIndex((el) => el.id === action.payload.id);
      if (sourceIndex === -1) return state;
      const source = state.elements[sourceIndex];
      const duplicate: BuilderElement = {
        ...source,
        id: generateId(),
        props: { ...source.props },
      };
      const elements = [...state.elements];
      elements.splice(sourceIndex + 1, 0, duplicate);
      return { ...state, elements, selectedElementId: duplicate.id };
    }
    case 'MOVE_ELEMENT_UP': {
      const index = state.elements.findIndex((el) => el.id === action.payload.id);
      if (index <= 0) return state;
      const elements = [...state.elements];
      [elements[index - 1], elements[index]] = [elements[index], elements[index - 1]];
      return { ...state, elements };
    }
    case 'MOVE_ELEMENT_DOWN': {
      const index = state.elements.findIndex((el) => el.id === action.payload.id);
      if (index === -1 || index >= state.elements.length - 1) return state;
      const elements = [...state.elements];
      [elements[index], elements[index + 1]] = [elements[index + 1], elements[index]];
      return { ...state, elements };
    }
    case 'ADD_CHAT_MESSAGE': {
      return { ...state, chatMessages: [...state.chatMessages, action.payload] };
    }
    case 'SET_BREAKPOINT': {
      return { ...state, activeBreakpoint: action.payload };
    }
    default:
      return state;
  }
}

interface BuilderContextType {
  state: BuilderState;
  dispatch: React.Dispatch<BuilderAction>;
  addElement: (type: ElementType, index?: number) => void;
  removeElement: (id: string) => void;
  selectElement: (id: string | null) => void;
  updateElementProps: (id: string, props: Record<string, unknown>) => void;
  reorderElements: (oldIndex: number, newIndex: number) => void;
  duplicateElement: (id: string) => void;
  moveElementUp: (id: string) => void;
  moveElementDown: (id: string) => void;
  setBreakpoint: (breakpoint: 'desktop' | 'tablet' | 'mobile') => void;
  sendChatMessage: (content: string) => void;
  getSelectedElement: () => BuilderElement | undefined;
}

const BuilderContext = createContext<BuilderContextType | null>(null);

export function BuilderProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(builderReducer, initialState);

  const addElement = useCallback((type: ElementType, index?: number) => {
    dispatch({ type: 'ADD_ELEMENT', payload: { elementType: type, index } });
  }, []);

  const removeElement = useCallback((id: string) => {
    dispatch({ type: 'REMOVE_ELEMENT', payload: { id } });
  }, []);

  const selectElement = useCallback((id: string | null) => {
    dispatch({ type: 'SELECT_ELEMENT', payload: { id } });
  }, []);

  const updateElementProps = useCallback((id: string, props: Record<string, unknown>) => {
    dispatch({ type: 'UPDATE_ELEMENT_PROPS', payload: { id, props } });
  }, []);

  const reorderElements = useCallback((oldIndex: number, newIndex: number) => {
    dispatch({ type: 'REORDER_ELEMENTS', payload: { oldIndex, newIndex } });
  }, []);

  const duplicateElement = useCallback((id: string) => {
    dispatch({ type: 'DUPLICATE_ELEMENT', payload: { id } });
  }, []);

  const moveElementUp = useCallback((id: string) => {
    dispatch({ type: 'MOVE_ELEMENT_UP', payload: { id } });
  }, []);

  const moveElementDown = useCallback((id: string) => {
    dispatch({ type: 'MOVE_ELEMENT_DOWN', payload: { id } });
  }, []);

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

    // Simulate AI response
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
    return state.elements.find((el) => el.id === state.selectedElementId);
  }, [state.selectedElementId, state.elements]);

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
        setBreakpoint,
        sendChatMessage,
        getSelectedElement,
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
    return "Great idea! I'd suggest starting with a Heading, then adding Input fields for Name and Email, a Text Area for the message, and finishing with a Submit button. You can drag these elements from the left panel, or I can help you plan the structure further.";
  }
  if (lower.includes('button')) {
    return "You can add buttons from the 'Buttons' section in the left panel. There are three types: Button (general purpose), Submit (for forms), and Reset (to clear form data). Each can be customized with different variants and sizes in the properties panel.";
  }
  if (lower.includes('layout') || lower.includes('column')) {
    return 'For layout, try using the Container element to wrap your content, and Columns to create multi-column layouts. You can also use Spacer and Divider elements to control spacing between sections.';
  }
  if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey')) {
    return "Hey there! 👋 I'm here to help you build your page. What would you like to create? You can describe a layout, form, or any component and I'll guide you through building it.";
  }
  return "I can help you with that! Try dragging elements from the left sidebar to the canvas, or describe what you'd like to build and I'll suggest the right components. You can also select any element on the canvas to edit its properties in the right panel.";
}
