type OpsMap = Record<string, string>

const DEFAULT_OPS_MAP: OpsMap = {
  gte: 'gte',
  lte: 'lte',
  gt: 'gt',
  lt: 'lt',
  in: 'in',
  notIn: 'notIn',
  contains: 'contains',
  startsWith: 'startsWith',
  endsWith: 'endsWith',
  equals: 'equals',
}

const DEFAULT_STRING_OPS_WITH_MODE = new Set(['equals', 'contains', 'startsWith', 'endsWith'])
/**
 * Convención default para listas/relaciones:
 * - si filter[field] es Array => { [field]: { some: { id: { in: array } } } }
 *
 * Si querés otra forma (ej: in directo para scalar arrays), lo cambiás en listHandlers.
 */
type ListHandler = (rawVal: unknown) => any | undefined

type BuildWhereOptions = {
  opsMap?: OpsMap
  /**
   * Para relaciones/listas (courses, tags, etc).
   * key = nombre del campo en filter, value = función que construye el where
   */
  listHandlers?: Record<string, ListHandler>

  /**
   * Si true, ignora objetos vacíos o inválidos silenciosamente (como tu código actual).
   * Si false, podrías tirar error 400 (acá lo dejamos en ignore para mantener tu comportamiento).
   */
  ignoreInvalid?: boolean

  stringMode?: 'sensitive' | 'insensitive' | 'default'
  stringOpsWithMode?: Set<string>
}

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return !!v && typeof v === 'object' && !Array.isArray(v)
}

function buildSomeIdIn(rawVal: unknown) {
  if (!Array.isArray(rawVal) || rawVal.length === 0) return undefined
  return { some: { id: { in: rawVal } } }
}

/**
 * Construye Prisma where desde query.filter
 */
export function buildFilterWhere<T = any>(
  filterObj: Record<string, unknown> | undefined,
  options?: BuildWhereOptions
): T {
  const {
    opsMap = DEFAULT_OPS_MAP,
    listHandlers = {},
    ignoreInvalid = true,
    stringMode = 'insensitive',
    stringOpsWithMode = DEFAULT_STRING_OPS_WITH_MODE,
  } = options || {}

  const parts: any[] = []
  const filter = filterObj ?? {}

  for (const [field, rawVal] of Object.entries(filter)) {
    // 1) handler custom por campo
    const handler = listHandlers[field]
    if (handler) {
      const node = handler(rawVal)
      if (node) parts.push({ [field]: node })
      continue
    }

    // 1b) convención Array => relación some.id.in
    if (Array.isArray(rawVal)) {
      const relNode = buildSomeIdIn(rawVal)
      if (relNode) parts.push({ [field]: relNode })
      continue
    }

    // 2) objeto => ops
    if (isPlainObject(rawVal)) {
      const node: Record<string, any> = {}
      let hasStringOpThatNeedsMode = false

      for (const [op, val] of Object.entries(rawVal)) {
        const prismaOp = opsMap[op]
        if (!prismaOp) {
          if (!ignoreInvalid) {
            // throw new Error(`Invalid operator: ${op}`)
          }
          continue
        }

        node[prismaOp] = val

        // marcar si corresponde mode insensitive
        if (
          stringMode === 'insensitive' &&
          typeof val === 'string' &&
          stringOpsWithMode.has(prismaOp)
        ) {
          hasStringOpThatNeedsMode = true
        }
      }

      // mode solo si realmente hubo un string op compatible
      if (hasStringOpThatNeedsMode) {
        node.mode = 'insensitive'
      }

      if (Object.keys(node).length > 0) {
        parts.push({ [field]: node })
      }
      continue
    }

    // 3) valor simple => equals
    if (rawVal !== undefined) {
      if (stringMode === 'insensitive' && typeof rawVal === 'string') {
        parts.push({ [field]: { equals: rawVal, mode: 'insensitive' } })
      } else {
        parts.push({ [field]: { equals: rawVal } })
      }
    }
  }

  if (parts.length === 0) return {} as T
  if (parts.length === 1) return parts[0]
  return { AND: parts } as T
}
