import vine from '@vinejs/vine'
import { idValidator } from '#validators/common'

export { idValidator }

export const createValidator = vine.create({
  name: vine.string().minLength(1).maxLength(200),
})

export const updateValidator = vine.create({
  params: vine.object({ id: vine.number() }),
  name: vine.string().minLength(1).maxLength(200).optional(),
})

export const deleteValidator = vine.create({
  params: vine.object({ id: vine.number(), force: vine.boolean().optional() }),
})
