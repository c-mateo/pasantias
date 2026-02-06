import vine from '@vinejs/vine'
import { UserRole } from '../../generated/prisma/enums.js'

export const idValidator = vine.create({
  params: vine.object({
    id: vine.number(),
  }),
})

// Validator shared across controllers for single `id` param
// Reuse this for routes that expect `params.id`

export const updateCuilValidator = vine.create({
  cuil: vine.string().regex(/^\d{2}-\d{8}-\d{1}$/),
  reason: vine.string().optional(),
  params: vine.object({
    id: vine.number(),
  }),
})

export const adminUpdateValidator = vine.create({
  params: vine.object({ id: vine.number() }),
  coursesIds: vine.array(vine.number()),
})

export const adminRoleValidator = vine.create({
  params: vine.object({ id: vine.number() }),
  role: vine.enum(UserRole),
})
