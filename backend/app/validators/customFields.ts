import { apiErrors } from '#exceptions/myExceptions'

export function validateCustomFieldsSchema(schema: any) {
  if (schema === undefined || schema === null) return

  if (typeof schema !== 'object' || Array.isArray(schema)) {
    throw apiErrors.validationFailed('customFieldsSchema must be an object')
  }

  // Accept common JSON Schema shape (has 'properties' or '$schema')
  const hasProperties = Object.prototype.hasOwnProperty.call(schema, 'properties')
  const hasFieldsArray = Array.isArray(schema.fields)
  const hasJsonSchemaTag = typeof schema['$schema'] === 'string'

  if (!hasProperties && !hasFieldsArray && !hasJsonSchemaTag) {
    throw apiErrors.validationFailed(
      'customFieldsSchema must contain either `properties`, a `fields` array, or `$schema`'
    )
  }

  if (hasProperties && typeof schema.properties !== 'object') {
    throw apiErrors.validationFailed('customFieldsSchema.properties must be an object')
  }
}

export default validateCustomFieldsSchema
