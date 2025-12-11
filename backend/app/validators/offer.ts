import vine from '@vinejs/vine'

export const validator = vine.compile(vine.object({
  params: vine.object({
    id: vine.number(),
  }),
}))

export const createValidator = vine.compile(
  vine.object({
    position: vine.string(),
    description: vine.string(),
    companyId: vine.number(),
    status: vine.enum(['DRAFT', 'ACTIVE']),
    vacancies: vine.number(),
    location: vine.string().optional(),
    salary: vine.number().optional(),
    durationWeeks: vine.number().optional(),
    startDate: vine.date().optional(),
    expiresAt: vine.date().optional(),

    skills: vine.array(vine.number()).optional(),
    requiredDocuments: vine.array(vine.number()).optional(),
  })
)

export const updateValidator = vine.compile(
  vine.object({
    params: vine.object({ id: vine.number() }),
    position: vine.string().optional(),
    description: vine.string().optional(),
    companyId: vine.number().optional(),
    status: vine.enum(['DRAFT', 'ACTIVE', 'CLOSED']).optional(),
    vacancies: vine.number().optional(),
    location: vine.string().optional(),
    salary: vine.number().optional(),
    durationWeeks: vine.number().optional(),
    startDate: vine.date().optional(),
    expiresAt: vine.date().optional(),

    skills: vine.array(vine.number()).optional(),
    requiredDocuments: vine.array(vine.number()).optional(),
  })
)
