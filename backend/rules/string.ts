import vine, { VineString } from '@vinejs/vine'
import { FieldContext } from '@vinejs/vine/types'

function setNullIfEmpty(value: unknown, _options: any, field: FieldContext) {
  if (typeof value === 'string' && value.trim().length === 0) {
    field.mutate(null, field)
  }
}

function normalizeSpaces(value: unknown, _options: any, field: FieldContext) {
  if (typeof value !== 'string') {
    return
  }

  field.mutate(value.replace(/\s+/g, ' ').trim(), field)
}

const normalizeSpacesRule = vine.createRule(normalizeSpaces)
const setNullIfEmptyRule = vine.createRule(setNullIfEmpty)

declare module '@vinejs/vine' {
  interface VineString {
    normalizeSpaces(): this
    setNullIfEmpty(): this
  }
}

export default function registerRule() {
  VineString.macro('normalizeSpaces', function (this: VineString) {
    return this.use(normalizeSpacesRule())
  })

  VineString.macro('setNullIfEmpty', function (this: VineString) {
    return this.use(setNullIfEmptyRule())
  })
}
