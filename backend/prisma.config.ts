import { defineConfig, env } from 'prisma/config'
import 'dotenv/config'

// Flag para distinguir generate/build
const isGenerate =
  ['1', 'true'].includes(process.env.PRISMA_GENERATE ?? '') ||
  process.argv.some((a) => a.includes('prisma') || a.includes('generate'))

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    url: isGenerate ? '' : env('DATABASE_URL'),
  },
})
