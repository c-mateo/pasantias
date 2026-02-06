import vine from '@vinejs/vine'

export const updateValidator = vine.create({
  phone: vine.string().optional(),
  address: vine.string().alphaNumeric({ allowSpaces: true }).optional(),
  city: vine.string().optional(),
  province: vine.string().optional(),
  skillsIds: vine.array(vine.number().withoutDecimals()).nullable().optional(),
})

export const requestEmailChangeValidator = vine.create({
  newEmail: vine.string().email(),
  currentPassword: vine.string(),
})

export const confirmEmailChangeValidator = vine.create({ token: vine.string() })

export const changePasswordValidator = vine.create({
  currentPassword: vine.string(),
  newPassword: vine.string().minLength(8),
})

export const setCuilValidator = vine.create({
  cuil: vine.string().regex(/^\d{2}-\d{8}-\d{1}$/),
})
