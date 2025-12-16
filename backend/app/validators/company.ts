import vine from '@vinejs/vine'

export const validator = vine.create({
  params: vine.object({
    id: vine.number(),
  }),
})

// Backwards-compatible alias for controllers that expect an `idValidator`
export const idValidator = validator

export const createValidator = vine.create({
  name: vine.string().minLength(3).maxLength(200),
  description: vine.string().optional(),
  website: vine.string().url().optional(),
  email: vine.string().email(),
  phone: vine.string().optional(),
  logo: vine.string().maxLength(500).url().optional(),
})

export const updateValidator = vine.create({
  params: vine.object({
    id: vine.number(),
  }),
  name: vine.string().minLength(3).maxLength(200).optional(),
  description: vine.string().optional(),
  website: vine.string().url().optional(),
  email: vine.string().email().optional(),
  phone: vine.string().optional(),
  logo: vine.string().maxLength(500).url().optional(),
})
