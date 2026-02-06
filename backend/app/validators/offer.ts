import vine from '@vinejs/vine'

export const validator = vine.create({
  params: vine.object({
    id: vine.number(),
  }),
})

export const createValidator = vine.create({
  position: vine.string(),
  description: vine.string(),
  companyId: vine.number(),
  status: vine.enum(['DRAFT', 'ACTIVE']),
  vacancies: vine.number(),
  requirements: vine.string().optional(),
  location: vine.string().optional(),
  salary: vine.number().optional(),
  durationWeeks: vine.number().optional(),
  startDate: vine
    .date({
      formats: ['iso8601'],
    })
    .optional(),
  expiresAt: vine
    .date({
      formats: ['iso8601'],
    })
    .optional(),

  courses: vine.array(vine.number()).optional(),
  skills: vine.array(vine.number()).optional(),
  requiredDocuments: vine.array(vine.number()).optional(),
})

export const updateValidator = vine.create({
  params: vine.object({ id: vine.number() }),
  position: vine.string().optional(),
  description: vine.string().optional(),
  companyId: vine.number().optional(),
  status: vine.enum(['DRAFT', 'ACTIVE', 'CLOSED']).optional(),
  vacancies: vine.number().optional(),
  requirements: vine.string().optional(),
  location: vine.string().optional(),
  salary: vine.number().optional(),
  durationWeeks: vine.number().optional(),
  startDate: vine
    .date({
      formats: ['iso8601'],
    })
    .optional(),
  expiresAt: vine
    .date({
      formats: ['iso8601'],
    })
    .optional(),

  courses: vine.array(vine.number()).optional(),
  skills: vine.array(vine.number()).optional(),
  requiredDocuments: vine.array(vine.number()).optional(),
})

export const paginationValidator = vine.create({
  limit: vine.number().range([1, 100]).optional(),
  after: vine.number().optional(),
  sort: vine
    .enum(['position', '-position', 'publishedAt', '-publishedAt', 'expiresAt', '-expiresAt'])
    .optional(),
  filter: vine
    .object({
      position: vine
        .object({
          contains: vine.string().optional(),
          eq: vine.string().optional(),
        })
        .optional(),
      status: vine
        .object({
          eq: vine.string().optional(),
          in: vine.array(vine.string()).optional(),
        })
        .optional(),
      companyId: vine
        .object({
          eq: vine.number().optional(),
          in: vine.array(vine.number()).optional(),
        })
        .optional(),
      courses: vine.array(vine.number()).optional(),
    })
    .optional(),
})
