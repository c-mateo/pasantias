import vine, { VineNumber, VineString } from '@vinejs/vine'
import { existRule } from '../../rules/exist.js'
import { FieldContext } from '@vinejs/vine/types'


function normalizeSpaces(value: unknown, _options: any, field: FieldContext) {
  if (typeof value !== 'string') {
    return
  }

  field.mutate(value.replace(/\s+/g, ' ').trim(), field)
}

const normalizeSpacesRule = vine.createRule(normalizeSpaces)

declare module '@vinejs/vine' {
  interface VineString {
    normalizeSpaces(): this
  }
}

VineString.macro('normalizeSpaces', function (this: VineString) {
  return this.use(normalizeSpacesRule())
})

export const idValidator = vine.compile(
  vine.object({
    params: vine.object({
      id: vine.number()
    })
  })
)

export const createCourseValidator = vine.compile(
  vine.object({
    name: vine.string().minLength(3).maxLength(200).normalizeSpaces()
  })
)

export const updateCourseValidator = vine.compile(
  vine.object({
    name: vine.string().minLength(3).maxLength(200).normalizeSpaces().optional(),
    params: vine.object({
      id: vine.number()
    })
  })
)