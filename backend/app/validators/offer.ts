import vine from '@vinejs/vine'

export const validator = vine.compile(vine.object({
  params: vine.object({
    id: vine.number(),
  }),
}))

export const createValidator = vine.compile(
  vine.object({
    title: vine.string(),
    description: vine.string(),
    companyId: vine.number(),
    status: vine.enum(['DRAFT', 'ACTIVE']),
    location: vine.string().optional().requiredWhen('status', '=', 'ACTIVE'),
    salary: vine.number().optional().requiredWhen('status', '=', 'ACTIVE'),
    durationWeeks: vine.number().optional().requiredWhen('status', '=', 'ACTIVE'),
    startDate: vine.date().optional().requiredWhen('status', '=', 'ACTIVE'),
    expiresAt: vine.date().optional().requiredWhen('status', '=', 'ACTIVE'),

    skills: vine.array(vine.number()).optional(),
    requiredDocuments: vine.array(vine.number()).optional(),
  })
)

export const updateValidator = vine.compile(
  vine.object({
    params: vine.object({ id: vine.number() }),
    title: vine.string().optional(),
    description: vine.string().optional(),
    companyId: vine.number().optional(),
    status: vine.enum(['DRAFT', 'ACTIVE', 'CLOSED']).optional(),
    location: vine.string().optional().requiredWhen('status', '=', 'ACTIVE'),
    salary: vine.number().optional().requiredWhen('status', '=', 'ACTIVE'),
    durationWeeks: vine.number().optional().requiredWhen('status', '=', 'ACTIVE'),
    startDate: vine.date().optional().requiredWhen('status', '=', 'ACTIVE'),
    expiresAt: vine.date().optional().requiredWhen('status', '=', 'ACTIVE'),

    skills: vine.array(vine.number()).optional(),
    requiredDocuments: vine.array(vine.number()).optional(),
  })
)
