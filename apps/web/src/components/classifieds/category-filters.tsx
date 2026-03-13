'use client';

import type { CategoryFieldDefinition } from '@/types/category-fields';

interface CategoryFiltersProps {
  fieldSchema: CategoryFieldDefinition[];
  values: Record<string, string>;
  onChange: (key: string, value: string) => void;
  onClear: () => void;
}

export function CategoryFilters({ fieldSchema, values, onChange, onClear }: CategoryFiltersProps) {
  const filterableFields = fieldSchema.filter((f) => f.filterable);

  if (filterableFields.length === 0) return null;

  const hasActiveFilters = Object.values(values).some((v) => v !== '');

  return (
    <div className="flex flex-wrap items-center gap-3">
      {filterableFields.map((field) => {
        if (field.type === 'select') {
          return (
            <div key={field.key} className="flex-shrink-0">
              <label htmlFor={`filter-${field.key}`} className="sr-only">{field.label}</label>
              <select
                id={`filter-${field.key}`}
                value={values[field.key] || ''}
                onChange={(e) => onChange(field.key, e.target.value)}
                className="px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">{field.label}: All</option>
                {(field.options || []).map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
          );
        }

        if (field.type === 'number') {
          return (
            <div key={field.key} className="flex items-center gap-1 flex-shrink-0">
              <label className="text-xs text-gray-500 mr-1">{field.label}:</label>
              <input
                type="number"
                placeholder="Min"
                value={values[`${field.key}_min`] || ''}
                onChange={(e) => onChange(`${field.key}_min`, e.target.value)}
                className="w-20 px-2 py-2 rounded-lg border border-gray-200 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
              <span className="text-gray-400">-</span>
              <input
                type="number"
                placeholder="Max"
                value={values[`${field.key}_max`] || ''}
                onChange={(e) => onChange(`${field.key}_max`, e.target.value)}
                className="w-20 px-2 py-2 rounded-lg border border-gray-200 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          );
        }

        if (field.type === 'boolean') {
          return (
            <div key={field.key} className="flex-shrink-0">
              <label htmlFor={`filter-${field.key}`} className="sr-only">{field.label}</label>
              <select
                id={`filter-${field.key}`}
                value={values[field.key] || ''}
                onChange={(e) => onChange(field.key, e.target.value)}
                className="px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">{field.label}: All</option>
                <option value="true">Yes</option>
                <option value="false">No</option>
              </select>
            </div>
          );
        }

        return null;
      })}

      {hasActiveFilters && (
        <button
          onClick={onClear}
          className="px-3 py-2 text-sm text-red-600 hover:text-red-700 font-medium"
        >
          Clear filters
        </button>
      )}
    </div>
  );
}
