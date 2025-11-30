import { prisma } from '#start/prisma'
import type { HttpContext } from '@adonisjs/core/http'
import encryption from '@adonisjs/core/services/encryption'
import vine from '@vinejs/vine'

type PartialOrNullable<T> = {
  [P in keyof T]?: T[P] | null
}

type SkipNullable<T> = {
  [K in keyof T as null extends T[K] ? never : K]: T[K]
}

type NullableToOptional<T> = {
  // Las propiedades que permiten null → se vuelven opcionales
  [K in keyof T as null extends T[K] ? K : never]?: Exclude<T[K], null>
} & {
  // Las propiedades que NO permiten null → se dejan igual
  [K in keyof T as null extends T[K] ? never : K]: T[K]
}

type UserData = {
  email: string
  firstName: string
  lastName: string
  dni: string
  phone: string
  address: string
  province: string
  city: string
}

// export function encryptUserData(data: Record<string, string>): UserData {
//   for (const key in data) {
//     data[key] = encryption.encrypt(data[key]!)
//   }
//   return data
// }
type UserDataKey = keyof UserData

// Convierte las claves presentes en T ∩ UserData en REQUERIDAS
type StrictUserSubset<T extends object> =
  { [K in Extract<keyof T, UserDataKey>]: UserData[K] }

  

const userDataKeys = [
  "email",
  "firstName",
  "lastName",
  "dni",
  "phone",
  "address",
  "province",
  "city"
]

// Encripta solo las claves presentes en data que están en UserData
export function encryptUserData<T extends UserData>(
  data: T
): StrictUserSubset<T> {

  const result: any = {}

  for (const key of userDataKeys) {
    if (key in data) {
      result[key] = encryption.encrypt(data[key as UserDataKey])
    }
  }

  return result
}


export function decryptUserData<T extends PartialOrNullable<UserData>>(data: T): T {
  const result: any = { ...data }
  
  for (const key of userDataKeys) {
    if (key in data && data[key as UserDataKey]) {
      const decrypted = encryption.decrypt<string>(data[key as UserDataKey])
      if (!decrypted) throw new Error(`Failed to decrypt user data for key: ${key}`)
      result[key] = decrypted
    }
  }

  return result
}

const idValidator = vine.compile(
  vine.object({
    params: vine.object({
      id: vine.number(),
    }),
  })
)

export default class UsersController {
  
  async list({ request }: HttpContext) {
    const users = await prisma.user.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        email: true,
        phone: true,
        firstName: true,
        lastName: true,
        dni: true,
        role: true,
        createdAt: true,
        updatedAt: true
      }
    })
    return {
      data: users.map(decryptUserData),
    }
  }

  async get({ request }: HttpContext) {
    const { params } = await idValidator.validate(request)

    const user = await prisma.user.findUniqueOrThrow({
      where: {
        id: params.id,
      },
      select: {
        id: true,
        email: true,
        phone: true,
        firstName: true,
        lastName: true,
        dni: true,
        address: true,
        province: true,
        city: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      }
    })
    return {
      data: decryptUserData(user)
    }
  }

  // TODO: update user info. Que?

  async delete({ request, response }: HttpContext) {
    const { params } = await idValidator.validate(request)

    await prisma.user.guardedDelete({
      where: {
        id: params.id,
        role: 'STUDENT',
      },
    })

    response.noContent()
  }
  
}