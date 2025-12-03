import vine from '@vinejs/vine'

export const validator = vine.compile(
  vine.object({
    params: vine.object({
      id: vine.number(),
    }),
    customFieldsValues: vine.object({}).optional(),
  })
)

export const uploadValidator = vine.compile(
  vine.object({
    params: vine.object({
      offerId: vine.number(),
      reqDocId: vine.number(),
    }),
    headers: vine.object({
      'content-type': vine.string(),
      'content-length': vine.number(),
      'x-original-filename': vine.string(),
    }),
  })
)

export const deleteValidator = vine.compile(
  vine.object({
    params: vine.object({
      offerId: vine.number(),
      attachmentId: vine.number(),
    }),
  })
)

export const useExistingValidator = vine.compile(
  vine.object({
    params: vine.object({
      offerId: vine.number(),
    }),
    documentId: vine.number(),
  })
)

export const idValidator = vine.compile(
  vine.object({
    params: vine.object({
      offerId: vine.number(),
    }),
  })
)
