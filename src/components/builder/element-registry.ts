import type { ElementDefinition, ElementType, PropertySection } from './types';

export const elementCategories: { name: string; elements: ElementDefinition[] }[] = [
  {
    name: 'Layout',
    elements: [
      {
        type: 'container',
        label: 'Container',
        description: 'Content wrapper',
        icon: 'Square',
        category: 'Layout',
        defaultProps: { padding: '16', maxWidth: '1200' },
      },
      {
        type: 'columns',
        label: 'Columns',
        description: 'Multi-column layout',
        icon: 'Columns3',
        category: 'Layout',
        isNew: true,
        defaultProps: { columns: 2, gap: '16' },
      },
      {
        type: 'spacer',
        label: 'Spacer',
        description: 'Vertical spacing',
        icon: 'SeparatorHorizontal',
        category: 'Layout',
        defaultProps: { height: '32' },
      },
      {
        type: 'divider',
        label: 'Divider',
        description: 'Horizontal rule',
        icon: 'Minus',
        category: 'Layout',
        defaultProps: { color: '#333' },
      },
    ],
  },
  {
    name: 'Content',
    elements: [
      {
        type: 'heading',
        label: 'Heading',
        description: 'Section title',
        icon: 'Type',
        category: 'Content',
        defaultProps: { text: 'Heading', level: 'h2', alignment: 'left' },
      },
      {
        type: 'paragraph',
        label: 'Paragraph',
        description: 'Text block',
        icon: 'AlignLeft',
        category: 'Content',
        defaultProps: { text: 'Enter your text here...', alignment: 'left' },
      },
      {
        type: 'image',
        label: 'Image',
        description: 'Image element',
        icon: 'ImageIcon',
        category: 'Content',
        defaultProps: { src: '', alt: '', width: 'auto', height: 'auto' },
      },
    ],
  },
  {
    name: 'Form Fields',
    elements: [
      {
        type: 'input',
        label: 'Text Input',
        description: 'Single line text',
        icon: 'TextCursorInput',
        category: 'Form Fields',
        defaultProps: { label: 'Text', placeholder: 'Enter text...', required: false, value: '' },
      },
      {
        type: 'email',
        label: 'Email',
        description: 'Email input field',
        icon: 'Mail',
        category: 'Form Fields',
        defaultProps: { label: 'Email', placeholder: 'Enter email...', required: false, value: '' },
      },
      {
        type: 'number',
        label: 'Number',
        description: 'Numeric input field',
        icon: 'Hash',
        category: 'Form Fields',
        defaultProps: { label: 'Number', placeholder: '0', required: false, value: '' },
      },
      {
        type: 'textarea',
        label: 'Text Area',
        description: 'Multi-line text',
        icon: 'AlignJustify',
        category: 'Form Fields',
        defaultProps: { label: 'Text Area', placeholder: 'Enter text...', rows: 4, required: false },
      },
      {
        type: 'select',
        label: 'Select',
        description: 'Dropdown select',
        icon: 'ChevronDown',
        category: 'Form Fields',
        defaultProps: { label: 'Select', placeholder: 'Choose option...', options: ['Option 1', 'Option 2', 'Option 3'] },
      },
      {
        type: 'checkbox',
        label: 'Checkbox',
        description: 'Checkbox input',
        icon: 'CheckSquare',
        category: 'Form Fields',
        defaultProps: { label: 'Checkbox', checked: false },
      },
      {
        type: 'checkbox-group',
        label: 'Checkbox Group',
        description: 'Group of checkboxes',
        icon: 'ListChecks',
        category: 'Form Fields',
        defaultProps: { label: 'Checkbox Group', options: ['Option 1', 'Option 2'] },
      },
      {
        type: 'radio-group',
        label: 'Radio Group',
        description: 'Group of radio buttons',
        icon: 'CircleDot',
        category: 'Form Fields',
        defaultProps: { label: 'Radio Group', options: ['Option 1', 'Option 2'] },
      },
      {
        type: 'switch',
        label: 'Switch',
        description: 'Toggle switch',
        icon: 'ToggleLeft',
        category: 'Form Fields',
        defaultProps: { label: 'Switch', checked: false },
      },
      {
        type: 'date-picker',
        label: 'Date Picker',
        description: 'Date picker input',
        icon: 'Calendar',
        isNew: true,
        category: 'Form Fields',
        defaultProps: { label: 'Date', placeholder: 'Pick a date...' },
      },
      {
        type: 'file-upload',
        label: 'File Upload',
        description: 'File upload field',
        icon: 'Upload',
        isNew: true,
        category: 'Form Fields',
        defaultProps: { label: 'Upload File', accept: '*', maxSize: '5MB' },
      },
    ],
  },
  {
    name: 'Buttons',
    elements: [
      {
        type: 'button',
        label: 'Button',
        description: 'Clickable button',
        icon: 'MousePointerClick',
        category: 'Buttons',
        defaultProps: { text: 'Button', variant: 'default', size: 'default' },
      },
      {
        type: 'submit',
        label: 'Submit',
        description: 'Form submit button',
        icon: 'Send',
        category: 'Buttons',
        defaultProps: { text: 'Submit', variant: 'default', size: 'default' },
      },
      {
        type: 'reset',
        label: 'Reset',
        description: 'Reset form values',
        icon: 'RotateCcw',
        category: 'Buttons',
        defaultProps: { text: 'Reset', variant: 'outline', size: 'default' },
      },
    ],
  },
];

export function getElementDefinition(type: ElementType): ElementDefinition | undefined {
  for (const category of elementCategories) {
    const found = category.elements.find((el) => el.type === type);
    if (found) return found;
  }
  return undefined;
}

export function getPropertiesForElement(type: ElementType): PropertySection[] {
  const commonAppearance: PropertySection = {
    id: 'appearance',
    label: 'Appearance',
    fields: [
      { key: 'visible', label: 'Visible', type: 'toggle', section: 'appearance' },
      {
        key: 'columnSpan',
        label: 'Column Span',
        type: 'select',
        section: 'appearance',
        options: Array.from({ length: 12 }, (_, i) => ({ label: `${i + 1}`, value: `${i + 1}` })),
      },
      {
        key: 'columnStart',
        label: 'Column Start',
        type: 'select',
        section: 'appearance',
        options: [{ label: 'Auto', value: 'auto' }, ...Array.from({ length: 12 }, (_, i) => ({ label: `${i + 1}`, value: `${i + 1}` }))],
      },
    ],
  };

  switch (type) {
    case 'input':
    case 'email':
    case 'number':
      return [
        {
          id: 'input',
          label: 'Input',
          fields: [
            { key: 'value', label: 'Value', type: 'text', section: 'input' },
            { key: 'placeholder', label: 'Placeholder', type: 'text', section: 'input' },
            { key: 'required', label: 'Required', type: 'toggle', section: 'input' },
          ],
        },
        {
          id: 'label',
          label: 'Label & Description',
          fields: [
            { key: 'showLabel', label: 'Show Label', type: 'toggle', section: 'label' },
            { key: 'label', label: 'Label', type: 'text', section: 'label' },
            {
              key: 'labelPosition',
              label: 'Label Position',
              type: 'select',
              section: 'label',
              options: [
                { label: 'Top', value: 'top' },
                { label: 'Left', value: 'left' },
                { label: 'Right', value: 'right' },
              ],
            },
            { key: 'labelAlignment', label: 'Label Alignment', type: 'alignment', section: 'label' },
          ],
        },
        commonAppearance,
      ];
    case 'textarea':
      return [
        {
          id: 'input',
          label: 'Input',
          fields: [
            { key: 'placeholder', label: 'Placeholder', type: 'text', section: 'input' },
            { key: 'rows', label: 'Rows', type: 'number', section: 'input' },
            { key: 'required', label: 'Required', type: 'toggle', section: 'input' },
          ],
        },
        {
          id: 'label',
          label: 'Label & Description',
          fields: [
            { key: 'showLabel', label: 'Show Label', type: 'toggle', section: 'label' },
            { key: 'label', label: 'Label', type: 'text', section: 'label' },
          ],
        },
        commonAppearance,
      ];
    case 'select':
      return [
        {
          id: 'input',
          label: 'Select Options',
          fields: [
            { key: 'placeholder', label: 'Placeholder', type: 'text', section: 'input' },
            { key: 'required', label: 'Required', type: 'toggle', section: 'input' },
          ],
        },
        {
          id: 'label',
          label: 'Label & Description',
          fields: [
            { key: 'showLabel', label: 'Show Label', type: 'toggle', section: 'label' },
            { key: 'label', label: 'Label', type: 'text', section: 'label' },
          ],
        },
        commonAppearance,
      ];
    case 'heading':
      return [
        {
          id: 'content',
          label: 'Content',
          fields: [
            { key: 'text', label: 'Text', type: 'text', section: 'content' },
            {
              key: 'level',
              label: 'Level',
              type: 'select',
              section: 'content',
              options: [
                { label: 'H1', value: 'h1' },
                { label: 'H2', value: 'h2' },
                { label: 'H3', value: 'h3' },
                { label: 'H4', value: 'h4' },
                { label: 'H5', value: 'h5' },
                { label: 'H6', value: 'h6' },
              ],
            },
            { key: 'alignment', label: 'Alignment', type: 'alignment', section: 'content' },
          ],
        },
        commonAppearance,
      ];
    case 'paragraph':
      return [
        {
          id: 'content',
          label: 'Content',
          fields: [
            { key: 'text', label: 'Text', type: 'text', section: 'content' },
            { key: 'alignment', label: 'Alignment', type: 'alignment', section: 'content' },
          ],
        },
        commonAppearance,
      ];
    case 'button':
    case 'submit':
    case 'reset':
      return [
        {
          id: 'button',
          label: 'Button',
          fields: [
            { key: 'text', label: 'Text', type: 'text', section: 'button' },
            {
              key: 'variant',
              label: 'Variant',
              type: 'select',
              section: 'button',
              options: [
                { label: 'Default', value: 'default' },
                { label: 'Secondary', value: 'secondary' },
                { label: 'Outline', value: 'outline' },
                { label: 'Ghost', value: 'ghost' },
                { label: 'Destructive', value: 'destructive' },
              ],
            },
            {
              key: 'size',
              label: 'Size',
              type: 'select',
              section: 'button',
              options: [
                { label: 'Small', value: 'sm' },
                { label: 'Default', value: 'default' },
                { label: 'Large', value: 'lg' },
              ],
            },
          ],
        },
        commonAppearance,
      ];
    case 'checkbox':
    case 'switch':
      return [
        {
          id: 'input',
          label: 'Input',
          fields: [
            { key: 'checked', label: 'Checked', type: 'toggle', section: 'input' },
          ],
        },
        {
          id: 'label',
          label: 'Label & Description',
          fields: [
            { key: 'label', label: 'Label', type: 'text', section: 'label' },
          ],
        },
        commonAppearance,
      ];
    case 'radio-group':
    case 'checkbox-group':
      return [
        {
          id: 'label',
          label: 'Label & Description',
          fields: [
            { key: 'label', label: 'Label', type: 'text', section: 'label' },
          ],
        },
        commonAppearance,
      ];
    case 'spacer':
      return [
        {
          id: 'spacing',
          label: 'Spacing',
          fields: [
            { key: 'height', label: 'Height (px)', type: 'number', section: 'spacing' },
          ],
        },
      ];
    case 'divider':
      return [
        {
          id: 'style',
          label: 'Style',
          fields: [
            { key: 'color', label: 'Color', type: 'color', section: 'style' },
          ],
        },
        commonAppearance,
      ];
    default:
      return [commonAppearance];
  }
}
