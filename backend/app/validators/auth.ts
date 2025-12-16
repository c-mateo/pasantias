import vine from '@vinejs/vine'

export const registerValidator = vine.create({
  email: vine.string().email(),
  password: vine.string().minLength(8),
  firstName: vine.string().alpha({ allowSpaces: true }),
  lastName: vine.string().alpha({ allowSpaces: true }),
})

export const loginValidator = vine.create({
  email: vine.string().email(),
  password: vine.string(),
})

export const forgotPasswordValidator = vine.create({ email: vine.string().email() })

export const resetPasswordValidator = vine.create({
  token: vine.string(),
  password: vine.string().minLength(8),
})
