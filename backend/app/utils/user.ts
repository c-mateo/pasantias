import encryption from '@adonisjs/core/services/encryption'
import type { PartialOrNullable } from '../types/common.js'
import type { UserData, UserDataKey, StrictUserSubset } from '../types/user.js'

export const userDataKeys: UserDataKey[] = [
  'email',
  'firstName',
  'lastName',
  'dni',
  'phone',
  'address',
  'province',
  'city',
]

export function encryptUserData<T extends UserData>(data: T): StrictUserSubset<T> {
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
