import vine from '@vinejs/vine'

export const idValidator = vine.compile(vine.object({
  params: vine.object({
    id: vine.number(),
  }),
}))

export const createValidator = vine.compile(
  vine.object({
    name: vine.string().minLength(1).maxLength(200),
    description: vine.string().optional(),
  })
)

export const updateValidator = vine.compile(
  vine.object({
    params: vine.object({ id: vine.number() }),
    name: vine.string().minLength(1).maxLength(200).optional(),
    description: vine.string().optional(),
  })
)

export const deleteValidator = vine.compile(
  vine.object({
    params: vine.object({ id: vine.number() }),
    force: vine.boolean().optional(),
  })
)
