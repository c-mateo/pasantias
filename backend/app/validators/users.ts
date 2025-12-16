import vine from '@vinejs/vine'

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
