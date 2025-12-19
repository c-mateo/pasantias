import vine from '@vinejs/vine'

export const validator = vine.create({
  params: vine.object({
    offerId: vine.number(),
  }),
  customFieldsValues: vine.object({}).optional(),
})

export const uploadValidator = vine.create({
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

export const deleteValidator = vine.create({
  params: vine.object({
    offerId: vine.number(),
    attachmentId: vine.number(),
  }),
})

export const useExistingValidator = vine.create({
  params: vine.object({
    offerId: vine.number(),
  }),
  documentId: vine.number(),
})

export const idValidator = vine.create({
  params: vine.object({
    offerId: vine.number(),
  }),
})
