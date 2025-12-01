export type PartialOrNullable<T> = {
  [P in keyof T]?: T[P] | null
}

export type SkipNullable<T> = {
  [K in keyof T as null extends T[K] ? never : K]: T[K]
}

export type NullableToOptional<T> = {
  // Las propiedades que permiten null → se vuelven opcionales
  [K in keyof T as null extends T[K] ? K : never]?: Exclude<T[K], null>
} & {
  // Las propiedades que NO permiten null → se dejan igual
  [K in keyof T as null extends T[K] ? never : K]: T[K]
}
