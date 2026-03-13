import { CategoryFieldDefinition } from '../interfaces/category-field.interface';

interface ValidationResult {
  valid: boolean;
  errors: Record<string, string>;
  sanitized: Record<string, unknown>;
}

export function validateCategoryFields(
  schema: CategoryFieldDefinition[],
  values: Record<string, unknown>,
): ValidationResult {
  const errors: Record<string, string> = {};
  const sanitized: Record<string, unknown> = {};

  for (const field of schema) {
    const value = values[field.key];
    const isEmpty =
      value === undefined || value === null || value === '';

    // Required check
    if (field.required && isEmpty) {
      errors[field.key] = field.validation?.message || `${field.label} is required`;
      continue;
    }

    if (isEmpty) continue;

    // Type-specific validation
    switch (field.type) {
      case 'text':
      case 'textarea':
      case 'url': {
        if (typeof value !== 'string') {
          errors[field.key] = `${field.label} must be a string`;
          break;
        }
        const str = value.trim();
        if (field.validation?.min !== undefined && str.length < field.validation.min) {
          errors[field.key] =
            field.validation.message || `${field.label} must be at least ${field.validation.min} characters`;
          break;
        }
        if (field.validation?.max !== undefined && str.length > field.validation.max) {
          errors[field.key] =
            field.validation.message || `${field.label} must be at most ${field.validation.max} characters`;
          break;
        }
        if (field.validation?.pattern) {
          const regex = new RegExp(field.validation.pattern);
          if (!regex.test(str)) {
            errors[field.key] = field.validation.message || `${field.label} format is invalid`;
            break;
          }
        }
        sanitized[field.key] = str;
        break;
      }

      case 'number': {
        const num = Number(value);
        if (isNaN(num)) {
          errors[field.key] = `${field.label} must be a number`;
          break;
        }
        if (field.validation?.min !== undefined && num < field.validation.min) {
          errors[field.key] =
            field.validation.message || `${field.label} must be at least ${field.validation.min}`;
          break;
        }
        if (field.validation?.max !== undefined && num > field.validation.max) {
          errors[field.key] =
            field.validation.message || `${field.label} must be at most ${field.validation.max}`;
          break;
        }
        sanitized[field.key] = num;
        break;
      }

      case 'select': {
        if (typeof value !== 'string') {
          errors[field.key] = `${field.label} must be a string`;
          break;
        }
        if (field.options && !field.options.includes(value)) {
          errors[field.key] = `${field.label} must be one of: ${field.options.join(', ')}`;
          break;
        }
        sanitized[field.key] = value;
        break;
      }

      case 'date': {
        if (typeof value !== 'string') {
          errors[field.key] = `${field.label} must be a date string`;
          break;
        }
        const date = new Date(value);
        if (isNaN(date.getTime())) {
          errors[field.key] = `${field.label} must be a valid date`;
          break;
        }
        sanitized[field.key] = value;
        break;
      }

      case 'boolean': {
        if (typeof value !== 'boolean') {
          errors[field.key] = `${field.label} must be true or false`;
          break;
        }
        sanitized[field.key] = value;
        break;
      }

      default:
        sanitized[field.key] = value;
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
    sanitized,
  };
}
