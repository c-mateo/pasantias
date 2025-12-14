import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../generated/prisma/client.js'
import env from './env.js'
import { guardModelExtension, paginationExtension } from '../prisma/extensions.js'

const user = env.get('DB_USER')
const password = env.get('DB_PASSWORD') || ''
const host = env.get('DB_HOST')
const port = env.get('DB_PORT')
const database = env.get('DB_DATABASE')
const databaseUrl = `postgresql://${user}:${password}@${host}:${port}/${database}`
console.log('Database URL:', databaseUrl)

// env.set('DATABASE_URL', databaseUrl)

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

// console.group(await prisma.user.findMany({}))

// const datos = [
//   { name: 'Licenciatura en Educación', shortName: 'EDU' },
//   {
//     name: 'Licenciatura en Industrias Alimentarias',
//     shortName: 'LIA',
//   },
//   {
//     name: 'Licenciatura en Gestión de la Tecnología',
//     shortName: 'GT',
//   },
//   {
//     name: 'Licenciatura en Administración y gestión de la información',
//     shortName: 'AGI',
//   },
//   {
//     name: 'Licenciatura en Ciencias del Entretenimiento',
//     shortName: 'CE',
//   },
//   {
//     name: 'Licenciatura en Automatización y Robótica',
//     shortName: 'BOT',
//   },
//   {
//     name: 'Licenciatura en Diseño Industrial',
//     shortName: 'DI',
//   },
//   {
//     name: 'Licenciatura en Medios Audiovisuales y Digitales',
//     shortName: 'MAD',
//   },
//   {
//     name: 'Licenciatura en Producción de Videojuegos y entretenimiento digital',
//     shortName: 'LPVED',
//   },
//   { name: 'Licenciatura en Relaciones del Trabajo', shortName: 'RRTT' },
//   { name: 'Licenciatura en Bioinformática', shortName: 'BIO' },
//   { name: 'Licenciatura en Agroinformática', shortName: 'AGRO' },
//   { name: 'Licenciatura en Tecnología Ambiental y Energías Renovables', shortName: 'TAM' },
//   { name: 'Licenciatura en Gestión de la Tecnología aplicada a Logística', shortName: 'LOGI' },
//   { name: 'Licenciatura en Industrias Creativas', shortName: 'CREA' },
//   { name: 'Tecnicatura en Mecatrónica', shortName: 'MEC' },
//   { name: 'Tecnicatura en Entrenamiento Deportivo', shortName: 'DEP' },
//   { name: 'Tecnicatura en Análisis de Datos', shortName: 'DATA' },
//   { name: 'Tecnicatura en Biotecnología', shortName: 'BIOTECNO' },
//   { name: 'Tecnicatura en Industria y Tecnología de la Maquinaria Agrícola', shortName: 'MAQ' },
//   { name: 'Ingeniería en Computación', shortName: 'IC' },
//   { name: 'Especialización en docencia universitaria', shortName: 'UNI' },
//   { name: 'Maestría en Administración de Empresas', shortName: 'MBA' },
//   { name: 'Maestría en Energías Renovables', shortName: 'MER' },
//   { name: 'Maestría en Gestión de la Información', shortName: 'MGI' },
//   { name: 'Maestría en Educación y Tecnologías Digitales', shortName: 'EDUTEC' },
//   { name: 'Maestría en Tecnología e Innovación Alimentaria', shortName: 'TEIA' },
// ]

// const fakeCompanies = [
//   { name: "Tech Solutions", description: "Innovative tech company", website: "https://techsolutions.com", email: "info@techsolutions.com"},
//   { name: "Green Energy Corp", description: "Sustainable energy solutions", website: "https://greenenergy.com", email: "contact@greenenergy.com"},
//   { name: "HealthPlus", description: "Healthcare services provider", website: "https://healthplus.com", email: "support@healthplus.com"},
//   { name: "EduSmart", description: "E-learning platform", website: "https://edusmart.com", email: "info@edusmart.com"},
//   { name: "FinTech Innovations", description: "Financial technology solutions", website: "https://fintechinnovations.com", email: "contact@fintechinnovations.com"},
//   { name: "AutoDrive", description: "Autonomous vehicle technology", website: "https://autodrive.com", email: "info@autodrive.com"}
// ]

// await prisma.company.createMany({
//   data: fakeCompanies
// })

// await prisma.course.createMany({
//   data: datos,
//   skipDuplicates: true,
// })

// console.log(await prisma.course.findMany())

process.on('beforeExit', async () => {
  await prisma.$disconnect()
})
