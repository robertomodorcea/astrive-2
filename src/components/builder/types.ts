export type ElementType =
  | 'heading'
  | 'paragraph'
  | 'input'
  | 'email'
  | 'number'
  | 'textarea'
  | 'select'
  | 'checkbox'
  | 'checkbox-group'
  | 'radio-group'
  | 'switch'
  | 'date-picker'
  | 'file-upload'
  | 'button'
  | 'submit'
  | 'reset'
  | 'image'
  | 'spacer'
  | 'divider'
  | 'columns'
  | 'container'
  | 'grid'
  | 'flex';

export interface ElementDefinition {
  type: ElementType;
  label: string;
  description: string;
  icon: string;
  isNew?: boolean;
  category: string;
  defaultProps: Record<string, unknown>;
}

export interface BuilderElement {
  id: string;
  type: ElementType;
  label: string;
  props: Record<string, unknown>;
}

export interface PropertyField {
  key: string;
  label: string;
  type: 'text' | 'number' | 'select' | 'toggle' | 'color' | 'alignment' | 'slider';
  options?: { label: string; value: string }[];
  section: string;
}

export interface PropertySection {
  id: string;
  label: string;
  fields: PropertyField[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface BuilderState {
  elements: BuilderElement[];
  selectedElementId: string | null;
  chatMessages: ChatMessage[];
  activeBreakpoint: 'desktop' | 'tablet' | 'mobile';
}
