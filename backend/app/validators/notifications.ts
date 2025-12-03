import vine from '@vinejs/vine'

export const idValidator = vine.compile(
  vine.object({
    params: vine.object({
      id: vine.number(),
    }),
  })
)

export const broadcastValidator = vine.compile(
  vine.object({
    title: vine.string().minLength(1),
    message: vine.string().minLength(1),
    userIds: vine.array(vine.number()).optional(),
  })
)
