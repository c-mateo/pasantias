import vine from '@vinejs/vine'
import { idValidator } from '#validators/common'

export { idValidator }

export const broadcastValidator = vine.create({
  title: vine.string().minLength(1),
  message: vine.string().minLength(1),
  userIds: vine.array(vine.number()).optional(),
})
