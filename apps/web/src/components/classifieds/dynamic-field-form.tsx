'use client';

import type { CategoryFieldDefinition } from '@/types/category-fields';

interface DynamicFieldFormProps {
  fieldSchema: CategoryFieldDefinition[];
  values: Record<string, unknown>;
  onChange: (key: string, value: unknown) => void;
  errors?: Record<string, string>;
}

const GROUP_LABELS: Record<string, string> = {
  basic: 'Basic Information',
  details: 'Details',
  optional: 'Additional Information',
};

const GROUP_ORDER = ['basic', 'details', 'optional'];

const inputClass =
  'w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm';

export function DynamicFieldForm({ fieldSchema, values, onChange, errors }: DynamicFieldFormProps) {
  if (!fieldSchema || fieldSchema.length === 0) return null;

  const groups = new Map<string, CategoryFieldDefinition[]>();
  for (const field of fieldSchema) {
    const g = field.group || 'optional';
    if (!groups.has(g)) groups.set(g, []);
    groups.get(g)!.push(field);
  }

  // Sort fields within each group
  for (const fields of groups.values()) {
    fields.sort((a, b) => a.sort_order - b.sort_order);
  }

  const sortedGroupKeys = Array.from(groups.keys()).sort(
    (a, b) => (GROUP_ORDER.indexOf(a) === -1 ? 99 : GROUP_ORDER.indexOf(a)) -
              (GROUP_ORDER.indexOf(b) === -1 ? 99 : GROUP_ORDER.indexOf(b))
  );

  return (
    <div className="space-y-6">
      {sortedGroupKeys.map((groupKey) => {
        const fields = groups.get(groupKey)!;
        return (
          <div key={groupKey}>
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3 pb-2 border-b border-gray-100">
              {GROUP_LABELS[groupKey] || groupKey}
            </h3>
            <div className="space-y-4">
              {fields.map((field) => (
                <FieldInput
                  key={field.key}
                  field={field}
                  value={values[field.key]}
                  onChange={(val) => onChange(field.key, val)}
                  error={errors?.[field.key]}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function FieldInput({
  field,
  value,
  onChange,
  error,
}: {
  field: CategoryFieldDefinition;
  value: unknown;
  onChange: (value: unknown) => void;
  error?: string;
}) {
  const strValue = value !== undefined && value !== null ? String(value) : '';

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {field.label}
        {field.required && <span className="text-red-500 ml-0.5">*</span>}
      </label>

      {field.type === 'select' && (
        <select
          value={strValue}
          onChange={(e) => onChange(e.target.value || undefined)}
          className={inputClass}
        >
          <option value="">{field.placeholder || `Select ${field.label}...`}</option>
          {(field.options || []).map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      )}

      {field.type === 'textarea' && (
        <textarea
          value={strValue}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          rows={3}
          className={`${inputClass} resize-none`}
        />
      )}

      {field.type === 'boolean' && (
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={value === true}
            onChange={(e) => onChange(e.target.checked)}
            className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
          />
          <span className="text-sm text-gray-600">{field.placeholder || 'Yes'}</span>
        </label>
      )}

      {field.type === 'number' && (
        <input
          type="number"
          value={strValue}
          onChange={(e) => onChange(e.target.value ? Number(e.target.value) : undefined)}
          placeholder={field.placeholder}
          min={field.validation?.min}
          max={field.validation?.max}
          className={inputClass}
        />
      )}

      {field.type === 'date' && (
        <input
          type="date"
          value={strValue}
          onChange={(e) => onChange(e.target.value || undefined)}
          className={inputClass}
        />
      )}

      {(field.type === 'text' || field.type === 'url') && (
        <input
          type={field.type === 'url' ? 'url' : 'text'}
          value={strValue}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          className={inputClass}
        />
      )}

      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
