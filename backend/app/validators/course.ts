import vine from '@vinejs/vine'
import { idValidator } from '#validators/common'

export { idValidator }

export const createCourseValidator = vine.create({
  name: vine.string().minLength(3).maxLength(200).normalizeSpaces(),
  shortName: vine
    .string()
    .minLength(1)
    .maxLength(50)
    .normalizeSpaces()
    .setNullIfEmpty()
    .nullable()
    .optional(),
  description: vine
    .string()
    .minLength(1)
    .maxLength(500)
    .normalizeSpaces()
    .setNullIfEmpty()
    .nullable()
    .optional(),
})

export const updateCourseValidator = vine.create({
  name: vine.string().minLength(3).maxLength(200).normalizeSpaces().optional(),
  shortName: vine
    .string()
    .minLength(1)
    .maxLength(50)
    .normalizeSpaces()
    .setNullIfEmpty()
    .nullable()
    .optional(),
  description: vine
    .string()
    .minLength(1)
    .maxLength(500)
    .normalizeSpaces()
    .setNullIfEmpty()
    .nullable()
    .optional(),
  params: vine.object({
    id: vine.number(),
  }),
})
