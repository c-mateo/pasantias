import vine from '@vinejs/vine'
import { idValidator } from '#validators/common'

export { idValidator }

export const updateStatusValidator = vine.create({
  status: vine.enum(['PENDING', 'BLOCKED', 'ACCEPTED', 'REJECTED'] as const),
  blockReason: vine.string().optional().requiredWhen('status', '=', 'BLOCKED'),
  feedback: vine.string().optional(),
  params: vine.object({
    id: vine.number(),
  }),
})
