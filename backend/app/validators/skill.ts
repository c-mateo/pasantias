import vine from '@vinejs/vine'
import { idValidator } from '#validators/common'

export { idValidator }

export const createValidator = vine.create({
  name: vine.string().minLength(1).maxLength(200),
  description: vine.string().optional(),
})

export const updateValidator = vine.create({
  params: vine.object({ id: vine.number() }),
  name: vine.string().minLength(1).maxLength(200).optional(),
  description: vine.string().optional(),
})

export const deleteValidator = vine.create({
  params: vine.object({ id: vine.number(), force: vine.boolean().optional() }),
})
