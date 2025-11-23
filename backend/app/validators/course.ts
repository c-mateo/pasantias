import vine from '@vinejs/vine'

export const idValidator = vine.compile(
  vine.object({
    params: vine.object({
      id: vine.number()
    })
  })
)

export const createCourseValidator = vine.compile(
  vine.object({
    name: vine.string().minLength(3).maxLength(200)
  })
)

export const updateCourseValidator = vine.compile(
  vine.object({
    name: vine.string().minLength(3).maxLength(200).optional(),
    params: vine.object({
      id: vine.number()
    })
  })
)