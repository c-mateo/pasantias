import hashService from '@adonisjs/core/services/hash'
import { sha256 } from '#utils/hash'
import { encryptUserData } from '#utils/user'
import { env } from 'prisma/config'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../generated/prisma/client.js'

const adapter = new PrismaPg({
  connectionString: env('DATABASE_URL'),
})

export const prisma = new PrismaClient({
  adapter,
  log: [
    { level: 'query', emit: 'event' },
    { level: 'info', emit: 'event' },
    { level: 'warn', emit: 'event' },
  ],
})

async function seed() {
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

  // Create users (admin + a few students)
  // We use the project's hash driver for consistency

  const passwordPlain = 'password123'
  const hashed = await hashService.make(passwordPlain)

  const usersToCreate: Array<{
    email: string
    password: string
    role: 'ADMIN' | 'STUDENT'
    firstName: string
    lastName: string
    dni: string
    phone: string
    address: string
    province: string
    city: string
  }> = [
    {
      email: 'admin@example.com',
      password: hashed,
      role: 'ADMIN',
      firstName: 'Admin',
      lastName: 'User',
      dni: '11111111',
      phone: '555-0001',
      address: 'Av. Principal 123',
      province: 'Buenos Aires',
      city: 'Ciudad',
    },
    {
      email: 'student1@example.com',
      password: hashed,
      role: 'STUDENT',
      firstName: 'Student1',
      lastName: 'One',
      dni: '22222222',
      phone: '555-0002',
      address: 'Calle 2 45',
      province: 'Buenos Aires',
      city: 'Olivos',
    },
    {
      email: 'student2@example.com',
      password: hashed,
      role: 'STUDENT',
      firstName: 'Student2',
      lastName: 'Two',
      dni: '33333333',
      phone: '555-0003',
      address: 'Calle 3 87',
      province: 'Córdoba',
      city: 'Córdoba',
    },
  ]

  for (const u of usersToCreate) {
    const encrypted = encryptUserData(u as any)
    const where = { emailHash: sha256(u.email) }
    await prisma.user.upsert({
      where,
      update: {
        ...(encrypted as any),
        password: u.password,
        role: u.role,
      } as any,
      create: {
        ...(encrypted as any),
        password: u.password,
        emailHash: sha256(u.email),
        role: u.role,
      } as any,
    })
  }

  console.log('Users seeded')

  // Documents (Attach a CV for student 1 and student 2)
  const docTypes = await prisma.documentType.findMany()
  const cvType = docTypes.find((d) => d.name === 'CV')
  // const dniType = docTypes.find((d) => d.name === 'DNI')

  const users = await prisma.user.findMany()
  const student1 = users.find((u) => u.emailHash === sha256('student1@example.com'))
  const student2 = users.find((u) => u.emailHash === sha256('student2@example.com'))

  if (student1 && cvType) {
    await prisma.document.create({
      data: {
        userId: student1.id,
        documentTypeId: cvType.id,
        originalName: 'student1_cv.pdf',
        size: 12345,
        path: '/uploads/documents/2025/seed/student1_cv.pdf',
        hash: sha256(student1.id + '-cv'),
      },
    })
  }
  if (student2 && cvType) {
    await prisma.document.create({
      data: {
        userId: student2.id,
        documentTypeId: cvType.id,
        originalName: 'student2_cv.pdf',
        size: 23456,
        path: '/uploads/documents/2025/seed/student2_cv.pdf',
        hash: sha256(student2.id + '-cv'),
      },
    })
  }
  console.log('Documents seeded')

  // Offers: create 2 offers per company; connect some skills and requiredDocs
  const skills = await prisma.skill.findMany()
  const companies = await prisma.company.findMany()

  // Document type ids
  const documentTypeMap = docTypes.reduce(
    (acc, dt) => ({ ...acc, [dt.name]: dt.id }),
    {} as Record<string, number>
  )
  const cvDocCreate = documentTypeMap['CV'] ? [{ documentTypeId: documentTypeMap['CV'] }] : []

  for (const c of companies) {
    await prisma.offer.create({
      data: {
        companyId: c.id,
        position: 'Programador',
        description: 'Desarrollador Fullstack para proyectos internos',
        status: 'ACTIVE',
        vacancies: 2,
        requirements: 'Experiencia con TypeScript y Node.js',
        location: 'Remoto',
        salary: 50000,
        durationWeeks: 12,
        startDate: new Date(),
        skills: {
          connect: skills
            .filter((s) => ['TypeScript', 'Node.js', 'React'].includes(s.name))
            .map((s) => ({ id: s.id })),
        },
        requiredDocs: { create: cvDocCreate },
      },
    })

    await prisma.offer.create({
      data: {
        companyId: c.id,
        position: 'Analista de Datos',
        description: 'Analista para proyectos de data',
        status: 'ACTIVE',
        vacancies: 1,
        requirements: 'SQL y Python',
        location: 'Remoto',
        salary: 45000,
        durationWeeks: 12,
        startDate: new Date(),
        skills: {
          connect: skills
            .filter((s) => ['SQL', 'Python'].includes(s.name))
            .map((s) => ({ id: s.id })),
        },
        requiredDocs: { create: cvDocCreate },
      },
    })
  }

  console.log('Offers seeded')

  // Optionally: create Drafts & Applications
  const firstOffer = await prisma.offer.findFirst()
  if (firstOffer && student1) {
    await prisma.draft.create({
      data: {
        userId: student1.id,
        offerId: firstOffer.id,
        customFieldsValues: { note: 'Interesado en prácticas' },
      },
    })

    await prisma.application.create({
      data: {
        userId: student1.id,
        offerId: firstOffer.id,
        status: 'PENDING',
      },
    })
  }

  console.log('Drafts/Applications seeded')

  console.log('Seeding completed')
}

seed()
  .catch((err) => {
    console.error('Seed error', err)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
