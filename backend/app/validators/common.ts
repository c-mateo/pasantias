import vine from '@vinejs/vine'

// Shared id validator for routes using `params.id`.
export const idValidator = vine.create({
  params: vine.object({
    id: vine.number(),
  }),
})

export function idParam(name = 'id') {
  return vine.create({ params: vine.object({ [name]: vine.number() } as any) })
}
