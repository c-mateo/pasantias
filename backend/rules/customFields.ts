import vine from '@vinejs/vine'
import { FieldContext } from '@vinejs/vine/types'

async function validateCustomSchema(value: unknown, _options: unknown, field: FieldContext) {
  if (value === undefined || value === null) return

  if (typeof value !== 'object' || Array.isArray(value)) {
    field.report('customFieldsSchema must be an object', 'type', field)
    return
  }

  const obj = value as Record<string, unknown>
  const hasProperties = Object.prototype.hasOwnProperty.call(obj, 'properties')
  const hasFields = Array.isArray(obj.fields)
  const hasJsonSchemaTag = typeof (obj as any)['$schema'] === 'string'

  if (!hasProperties && !hasFields && !hasJsonSchemaTag) {
    field.report(
      'customFieldsSchema must contain `properties` (JSON Schema) or `fields` array (UI schema) or `$schema`',
      'structure',
      field
    )
    return
  }

  if (hasProperties && typeof obj.properties !== 'object') {
    field.report('customFieldsSchema.properties must be an object', 'properties', field)
  }
}

export const customFieldsSchemaRule = vine.createRule(validateCustomSchema)

export default function registerRule() {
  // no macro registration required; controllers can use customFieldsSchemaRule()
}
