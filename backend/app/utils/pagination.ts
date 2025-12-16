import vine from '@vinejs/vine'
import { parseFIQL } from 'fiql'

// Cache compiled vine schemas per sortEnum reference to avoid recompilation on
// every request. Use a WeakMap so keys (enum objects) can be GC'd when no
// longer referenced.
const schemaCache: WeakMap<any, any> = new WeakMap()

const noEnumKey = {}

function compileSchema(sortEnum?: any) {
  const shape: Record<string, any> = {
    limit: vine.number().range([10, 100]).optional(),
    after: vine.number().optional(),
    filter: vine
      .any()
      .optional()
      .transform((v: any) => String(v)),
  }

  if (sortEnum) {
    shape.sort = vine.enum(sortEnum).optional()
  }

  return vine.create(shape)
}

export async function validatePagination(request: any, sortEnum: any = noEnumKey) {
  let schema: any

  schema = schemaCache.get(sortEnum)
  if (!schema) {
    schema = compileSchema(sortEnum)
    schemaCache.set(sortEnum ?? noEnumKey, schema)
  }

  return await schema.validate(request.qs())
}

export default validatePagination

export function buildWhere(...parts: Array<any>) {
  const partsFiltered = parts.filter(Boolean)
  if (!partsFiltered.length) return undefined
  if (partsFiltered.length === 1) return partsFiltered[0]
  return { AND: partsFiltered }
}

type PaginationOptions = {
  sortEnum?: any
  fieldMap?: Record<string, string>
}

export async function preparePagination(
  request: any,
  options?: PaginationOptions
): Promise<{ query: any; filterWhere?: object }> {
  const query = await validatePagination(request, options?.sortEnum)

  if (query.filter) {
    return { query, filterWhere: parseFIQL(query.filter, options?.fieldMap) }
  }

  return { query }
}
