import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../generated/prisma/client.js'
import env from './env.js'
import { guardModelExtension, paginationExtension } from '../prisma/extensions.js'

const databaseUrl = env.get('DATABASE_URL')

const adapter = new PrismaPg({
  connectionString: databaseUrl,
})

export const prisma = new PrismaClient({
  adapter,
  log: [
    { level: 'query', emit: 'event' },
    { level: 'info', emit: 'event' },
    { level: 'warn', emit: 'event' },
  ],
})
  .$extends(guardModelExtension)
  .$extends(paginationExtension)

process.on('beforeExit', async () => {
  await prisma.$disconnect()
})
