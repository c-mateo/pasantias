import vine from '@vinejs/vine'
import { idValidator } from '#validators/common'

export { idValidator }

export const broadcastValidator = vine.create({
  title: vine.string().minLength(1),
  message: vine.string().minLength(1),
  users: vine.unionOfTypes([vine.array(vine.number()), vine.literal('all')]).optional(),
})
