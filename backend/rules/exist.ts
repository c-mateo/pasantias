import { NotFoundException } from "#exceptions/myExceptions";
import { prisma } from "#start/prisma";
import vine, { VineNumber, VineString } from "@vinejs/vine";
import { FieldContext } from "@vinejs/vine/types";

type PublicKeys<T> = {
  [K in keyof T]: K extends `$${string}` ? never : K
}[keyof T];

type Table = PublicKeys<typeof prisma> & string;

export type ExistOptions = {
  table: Table
  primaryKey?: string
}

async function exist(value: unknown, options: ExistOptions, field: FieldContext) {
  if (!['string', 'number'].includes(typeof value)) {
    return
  }
  
  const record = await (prisma[options.table] as any).findUnique({ where: { [options.primaryKey ?? 'id']: value } })
  if (!record) {
    field.report(`The specified ${options.table} does not exist`, 'exists', field)
  }
}

export const existRule = vine.createRule(exist)

declare module '@vinejs/vine' {
  interface VineNumber {
    exist(options: ExistOptions): this
  }

  interface VineString {
    exist(options: ExistOptions): this
  }
}

export default function registerRule() {
  VineNumber.macro('exist', function (this: VineNumber, options: ExistOptions) {
    return this.use(existRule(options))
  })

  VineString.macro('exist', function (this: VineString, options: ExistOptions) {
    return this.use(existRule(options))
  })
}