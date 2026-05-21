import { useBuilder } from './BuilderContext';
import { getElementDefinition, getPropertiesForElement } from './element-registry';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  RotateCcw,
  Layers,
} from 'lucide-react';
import type { PropertyField } from './types';

function ToggleField({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="prop-toggle-group">
      <button
        className={`prop-toggle-btn ${value ? 'active' : ''}`}
        onClick={() => onChange(true)}
      >
        yes
      </button>
      <button
        className={`prop-toggle-btn ${!value ? 'active' : ''}`}
        onClick={() => onChange(false)}
      >
        no
      </button>
    </div>
  );
}

function AlignmentField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const options = [
    { value: 'left', icon: AlignLeft },
    { value: 'center', icon: AlignCenter },
    { value: 'right', icon: AlignRight },
    { value: 'justify', icon: AlignJustify },
  ];

  return (
    <div className="prop-alignment-group">
      {options.map((opt) => (
        <button
          key={opt.value}
          className={`prop-alignment-btn ${value === opt.value ? 'active' : ''}`}
          onClick={() => onChange(opt.value)}
        >
          <opt.icon className="h-3.5 w-3.5" />
        </button>
      ))}
    </div>
  );
}

function PropertyFieldRenderer({ field, value, onChange }: {
  field: PropertyField;
  value: unknown;
  onChange: (value: unknown) => void;
}) {
  switch (field.type) {
    case 'text':
      return (
        <Input
          value={(value as string) || ''}
          onChange={(e) => onChange(e.target.value)}
          className="prop-input"
        />
      );
    case 'number':
      return (
        <Input
          type="number"
          value={(value as number) || 0}
          onChange={(e) => onChange(Number(e.target.value))}
          className="prop-input"
        />
      );
    case 'select':
      return (
        <Select value={(value as string) || ''} onValueChange={onChange}>
          <SelectTrigger className="prop-select">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {field.options?.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    case 'toggle':
      return <ToggleField value={!!value} onChange={(v) => onChange(v)} />;
    case 'alignment':
      return <AlignmentField value={(value as string) || 'left'} onChange={(v) => onChange(v)} />;
    case 'color':
      return (
        <div className="prop-color-field">
          <input
            type="color"
            value={(value as string) || '#ffffff'}
            onChange={(e) => onChange(e.target.value)}
            className="prop-color-picker"
          />
          <Input
            value={(value as string) || '#ffffff'}
            onChange={(e) => onChange(e.target.value)}
            className="prop-input prop-color-text"
          />
        </div>
      );
    default:
      return (
        <Input
          value={(value as string) || ''}
          onChange={(e) => onChange(e.target.value)}
          className="prop-input"
        />
      );
  }
}

export function PropertiesPanel() {
  const { getSelectedElement, updateElementProps } = useBuilder();
  const selectedElement = getSelectedElement();

  if (!selectedElement) {
    return (
      <aside className="properties-panel">
        <div className="properties-empty">
          <div className="properties-empty-icon">
            <Layers className="h-8 w-8" />
          </div>
          <h4>No Element Selected</h4>
          <p>Select an element on the canvas to edit its properties.</p>
        </div>
      </aside>
    );
  }

  const definition = getElementDefinition(selectedElement.type);
  const sections = getPropertiesForElement(selectedElement.type);

  return (
    <aside className="properties-panel">
      <div className="properties-header">
        <span className="properties-header-type">{definition?.label || selectedElement.type}</span>
        <button className="properties-header-reset" title="Reset properties">
          <RotateCcw className="h-3.5 w-3.5" />
        </button>
      </div>

      <ScrollArea className="properties-scroll">
        <Accordion type="multiple" defaultValue={sections.map((s) => s.id)} className="properties-accordion">
          {sections.map((section) => (
            <AccordionItem key={section.id} value={section.id} className="properties-section">
              <AccordionTrigger className="properties-section-trigger">
                {section.label}
              </AccordionTrigger>
              <AccordionContent className="properties-section-content">
                <div className="properties-fields">
                  {section.fields.map((field) => (
                    <div key={field.key} className="property-row">
                      <Label className="property-label">{field.label}</Label>
                      <div className="property-control">
                        <PropertyFieldRenderer
                          field={field}
                          value={selectedElement.props[field.key]}
                          onChange={(value) =>
                            updateElementProps(selectedElement.id, { [field.key]: value })
                          }
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </ScrollArea>
    </aside>
  );
}
