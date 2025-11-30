import { prisma } from "#start/prisma";
import vine, { VineNumber, VineString } from "@vinejs/vine";
import { FieldContext } from "@vinejs/vine/types";

type PublicKeys<T> = {
  [K in keyof T]: K extends `$${string}` ? never : K
}[keyof T];

type Table = PublicKeys<typeof prisma> & string;

type Column<T extends Table> =
  keyof (typeof prisma[T])['fields']

type UniqueOptions<T extends Table> = {
  table: T
  column?: Column<T>
}

async function unique<T extends Table>(value: unknown, options: UniqueOptions<T>, field: FieldContext) {
  // if (typeof value !== 'number' || isNaN(value)) {
  //   return
  // }
  const record = await (prisma[options.table] as any).findUnique({ where: { [options.column ?? field.name]: value } })
  if (record) {
    field.report(`The specified ${options.table} already exist`, 'exists', field)
  }
}

export const uniqueRule = vine.createRule(unique)
  
declare module '@vinejs/vine' {
  interface VineNumber {
    unique<T extends Table>(options: UniqueOptions<T>): this
  }

  interface VineString {
    unique<T extends Table>(options: UniqueOptions<T>): this
  }
}

export default function registerRule() {
  VineNumber.macro('unique', function<T extends Table>(this: VineNumber, options: UniqueOptions<T>) {
    return this.use(uniqueRule(options))
  })

  VineString.macro('unique', function<T extends Table>(this: VineString, options: UniqueOptions<T>) {
    return this.use(uniqueRule(options))
  })
}