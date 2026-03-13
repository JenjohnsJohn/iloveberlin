export type FieldType =
  | 'text'
  | 'number'
  | 'select'
  | 'date'
  | 'boolean'
  | 'textarea'
  | 'url';

export interface FieldValidation {
  min?: number;
  max?: number;
  pattern?: string;
  message?: string;
}

export interface CategoryFieldDefinition {
  key: string;
  label: string;
  type: FieldType;
  required: boolean;
  options?: string[];
  placeholder?: string;
  validation?: FieldValidation;
  group: string;
  sort_order: number;
  filterable?: boolean;
  show_in_listing?: boolean;
}

export interface CategoryWithSchema {
  id: string;
  name: string;
  slug: string;
  description: string;
  field_schema: CategoryFieldDefinition[];
}
