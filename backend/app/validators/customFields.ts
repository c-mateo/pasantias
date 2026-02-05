import { apiErrors } from '#exceptions/my_exceptions'

export function validateCustomFieldsSchema(schema: any) {
  if (schema === undefined || schema === null) return

  if (typeof schema !== 'object' || Array.isArray(schema)) {
    throw apiErrors.validationError([{ field: 'customFieldsSchema', message: 'customFieldsSchema must be an object' }])
  }

  // Accept common JSON Schema shape (has 'properties' or '$schema')
  const hasProperties = Object.prototype.hasOwnProperty.call(schema, 'properties')
  const hasFieldsArray = Array.isArray(schema.fields)
  const hasJsonSchemaTag = typeof schema['$schema'] === 'string'

  if (!hasProperties && !hasFieldsArray && !hasJsonSchemaTag) {
    throw apiErrors.validationError([
      { field: 'customFieldsSchema', message: 'customFieldsSchema must contain either `properties`, a `fields` array, or `$schema`' },
    ])
  }

  if (hasProperties && typeof schema.properties !== 'object') {
    throw apiErrors.validationError([
      { field: 'customFieldsSchema.properties', message: 'customFieldsSchema.properties must be an object' },
    ])
  }
}

export default validateCustomFieldsSchema
