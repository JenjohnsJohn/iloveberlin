'use client';

import type { CategoryFieldDefinition } from '@/types/category-fields';

interface DynamicFieldDisplayProps {
  fieldSchema: CategoryFieldDefinition[];
  values: Record<string, unknown>;
}

const GROUP_LABELS: Record<string, string> = {
  basic: 'Basic Information',
  details: 'Details',
  optional: 'Additional Information',
};

const GROUP_ORDER = ['basic', 'details', 'optional'];

function formatValue(value: unknown, type: string): string {
  if (value === undefined || value === null || value === '') return '';
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (type === 'date' && typeof value === 'string') {
    try {
      return new Date(value).toLocaleDateString('en-GB', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return String(value);
    }
  }
  return String(value);
}

export function DynamicFieldDisplay({ fieldSchema, values }: DynamicFieldDisplayProps) {
  if (!fieldSchema || fieldSchema.length === 0 || !values || Object.keys(values).length === 0) {
    return null;
  }

  // Only show fields that have values
  const fieldsWithValues = fieldSchema.filter(
    (f) => values[f.key] !== undefined && values[f.key] !== null && values[f.key] !== '',
  );

  if (fieldsWithValues.length === 0) return null;

  const groups = new Map<string, CategoryFieldDefinition[]>();
  for (const field of fieldsWithValues) {
    const g = field.group || 'optional';
    if (!groups.has(g)) groups.set(g, []);
    groups.get(g)!.push(field);
  }

  for (const fields of groups.values()) {
    fields.sort((a, b) => a.sort_order - b.sort_order);
  }

  const sortedGroupKeys = Array.from(groups.keys()).sort(
    (a, b) => (GROUP_ORDER.indexOf(a) === -1 ? 99 : GROUP_ORDER.indexOf(a)) -
              (GROUP_ORDER.indexOf(b) === -1 ? 99 : GROUP_ORDER.indexOf(b))
  );

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Category Details</h2>
      {sortedGroupKeys.map((groupKey) => {
        const fields = groups.get(groupKey)!;
        return (
          <div key={groupKey} className="mb-4 last:mb-0">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              {GROUP_LABELS[groupKey] || groupKey}
            </h3>
            <div className="grid grid-cols-2 gap-x-6 gap-y-2">
              {fields.map((field) => {
                const formatted = formatValue(values[field.key], field.type);
                return (
                  <div key={field.key} className="py-1">
                    <dt className="text-sm text-gray-500">{field.label}</dt>
                    <dd className="text-sm font-medium text-gray-900">{formatted}</dd>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
