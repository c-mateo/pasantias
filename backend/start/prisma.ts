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

// env.set('DATABASE_URL', databaseUrl)

const adapter = new PrismaPg({
  connectionString: databaseUrl,
})

export const prisma = new PrismaClient({
  adapter,
  log: [
    { level: 'query', emit: 'event' },
    { level: 'info', emit: 'event' },
    { level: 'warn', emit: 'event' },]
}).$extends(guardModelExtension).$extends(paginationExtension);


// const datos = [
//   // { name: "Licenciatura en Educación" },
//   { name: "Licenciatura en Industrias Alimentarias" },
//   { name: "Licenciatura en Gestión de la Tecnología" },
//   { name: "Licenciatura en Administración y gestión de la información" },
//   { name: "Licenciatura en Ciencias del Entretenimiento" },
//   { name: "Licenciatura en Automatización y Robótica" },
//   { name: "Licenciatura en Diseño Industrial" },
//   { name: "Licenciatura en Medios Audiovisuales y Digitales" },
//   { name: "Licenciatura en Producción de Videojuegos y entretenimiento digital" },
//   { name: "Licenciatura en Relaciones del Trabajo" },
//   { name: "Licenciatura en Administración y gestión de la información" },
//   { name: "Licenciatura en Bioinformática" },
//   { name: "Licenciatura en Agroinformática" },
//   { name: "Licenciatura en Tecnología Ambiental y Energías Renovables" },
//   { name: "Licenciatura en Gestión de la Tecnología aplicada a Logística" },
//   { name: "Licenciatura en Industrias Creativas" },
//   { name: "Tecnicatura en Mecatrónica" },
//   { name: "Tecnicatura en Entrenamiento Deportivo" },
//   { name: "Tecnicatura en Análisis de Datos" },
//   { name: "Tecnicatura en Biotecnología" },
//   { name: "Tecnicatura en Industria y Tecnología de la Maquinaria Agrícola" },
//   { name: "Ingeniería en Computación" },
//   { name: "Especialización en docencia universitaria" },
//   { name: "Maestría en Administración de Empresas" },
//   { name: "Maestría en Energías Renovables" },
//   { name: "Maestría en Gestión de la Información" },
//   { name: "Maestría en Educación y Tecnologías Digitales" },
//   { name: "Diplomatura en Ciencias del Entrenamiento" },
//   { name: "Diplomatura en promoción deportiva" },
//   { name: "Diplomatura en Acompañamiento y abordaje territorial de situaciones por violencia por razones de género" },
//   { name: "Diplomatura universitaria en innovación y creatividad" },
//   { name: "Diplomatura universitaria en teatro para docentes" },
//   { name: "Diplomatura universitaria en estudios latinoamericanos" },
//   { name: "Diplomatura universitaria en eficiencia energética y energías renovables" },
//   { name: "Diplomatura en Desarrollo Eco sistémico y Economía Circular" },
//   { name: "Diplomatura en Movilidad Eléctrica Sustentable" },
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

process.on('beforeExit', async () => {
  await prisma.$disconnect()
})
