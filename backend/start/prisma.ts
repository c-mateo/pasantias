import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../generated/prisma/client.js'
import env from './env.js'
import {
  autoDecryptionExtension,
  guardModelExtension,
  paginationExtension,
} from '../prisma/extensions.js'
// Job imports removed here as they are imported where needed by controllers/jobs

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
  .$extends(autoDecryptionExtension)

process.on('beforeExit', async () => {
  await prisma.$disconnect()
})
