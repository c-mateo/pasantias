export type UserData = {
  email: string
  firstName: string
  lastName: string
  dni: string
  phone: string | null
  address: string | null
  province: string | null
  city: string | null
}

export type UserDataKey = keyof UserData

// Convierte las claves presentes en T ∩ UserData en REQUERIDAS
export type StrictUserSubset<T extends object> = {
  [K in Extract<keyof T, UserDataKey>]: UserData[K]
}
