export type UserData = {
  email: string
  firstName: string
  lastName: string
  dni: string
  phone: string
  address: string
  province: string
  city: string
}

export type UserDataKey = keyof UserData

// Convierte las claves presentes en T ∩ UserData en REQUERIDAS
export type StrictUserSubset<T extends object> =
  { [K in Extract<keyof T, UserDataKey>]: UserData[K] }
