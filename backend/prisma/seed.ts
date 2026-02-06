import { sha256 } from '#utils/hash'
import { PrismaClient } from '../generated/prisma/client.js'

export async function seed(prisma: PrismaClient) {
  console.log('Starting seed...')

  // Courses (some sample courses)
  const coursesData = [
    { name: 'Ingeniería en Computación' },
    { name: 'Licenciatura en Industrias Alimentarias' },
    { name: 'Licenciatura en Gestión de la Tecnología' },
    { name: 'Tecnicatura en Mecatrónica' },
  ]

  await prisma.course.createMany({ data: coursesData, skipDuplicates: true })
  console.log('Courses seeded')

  // Document types
  const documentTypesData = [
    { name: 'CV', description: 'Curriculum Vitae' },
    { name: 'DNI', description: 'Documento Nacional de Identidad' },
    { name: 'Licencia de Conducir', description: 'Licencia de Conducir' },
    { name: 'Constancia de Estudios', description: 'Constancia o certificado académico' },
    { name: 'Carta de Presentación', description: 'Carta de presentación del postulante' },
  ]
  await prisma.documentType.createMany({ data: documentTypesData, skipDuplicates: true })
  console.log('DocumentTypes seeded')

  // Skills
  const skillsData = [
    { name: 'JavaScript' },
    { name: 'TypeScript' },
    { name: 'React' },
    { name: 'Node.js' },
    { name: 'SQL' },
    { name: 'Python' },
    { name: 'Data Analysis' },
    { name: 'UI/UX' },
  ]
  await prisma.skill.createMany({ data: skillsData, skipDuplicates: true })
  console.log('Skills seeded')

  // Companies
  const companiesData = [
    {
      name: 'Tech Solutions',
      description: 'Innovative tech company',
      website: 'https://techsolutions.com',
      email: 'info@techsolutions.com',
    },
    {
      name: 'Green Energy Corp',
      description: 'Sustainable energy solutions',
      website: 'https://greenenergy.com',
      email: 'contact@greenenergy.com',
    },
    {
      name: 'HealthPlus',
      description: 'Healthcare services provider',
      website: 'https://healthplus.com',
      email: 'support@healthplus.com',
    },
    {
      name: 'EduSmart',
      description: 'E-learning platform',
      website: 'https://edusmart.com',
      email: 'info@edusmart.com',
    },
    {
      name: 'FinTech Innovations',
      description: 'Financial technology solutions',
      website: 'https://fintechinnovations.com',
      email: 'contact@fintechinnovations.com',
    },
    {
      name: 'AutoDrive',
      description: 'Autonomous vehicle technology',
      website: 'https://autodrive.com',
      email: 'info@autodrive.com',
    },
  ]
  await prisma.company.createMany({ data: companiesData, skipDuplicates: true })
  console.log('Companies seeded')

  // Optional: user/document seeding removed for brevity. Reintroduce
  // specific user upserts or document creation here when required.

  // Optionally: create Drafts & Applications or other test data here.
  console.log('Seeding completed')
}
