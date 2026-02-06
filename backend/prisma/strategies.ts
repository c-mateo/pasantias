// utils/db-strategies.ts
import { apiErrors } from '#exceptions/my_exceptions'
import { Prisma } from '@prisma/client'
import { equals } from '../utils/equals.js'
import { areSameType } from '../utils/areSameType.js'

type Strategy = (
  error: Prisma.PrismaClientKnownRequestError,
  model: any,
  input: any
) => Promise<void> | void

// The names of the fields that form a compound unique constraint
type Constraint = string[]

export type FieldContext = {
  name: string | Constraint
  equals?: (a: any, b: any) => boolean
  launchCustomException?: (data: { resourceType: string; field: string; value: string }) => void
}

export type Field = string | Constraint | FieldContext

// --- ESTRATEGIA: UNIQUE CONSTRAINT (P2002) ---
export function checkUnique(fields: Field[]): Strategy {
  return async (error, model, input) => {
    if (error.code !== 'P2002') return

    // fieldNames can be retrieved from error.meta.target when needed
    let contexts = fields.map((field) =>
      typeof field === 'object' && 'name' in field ? field : { name: field }
    )

    // 1. Filtrar campos presentes en el input
    const checks = contexts
      .map((context) => {
        if (typeof context.name === 'string') {
          return input[context.name] !== undefined ? { [context.name]: input[context.name] } : null
        } else {
          // Compuestos: Todos los campos deben estar presentes
          const hasAll = context.name.every((f) => input[f] !== undefined)
          return hasAll ? context.name.reduce((acc, f) => ({ ...acc, [f]: input[f] }), {}) : null
        }
      })
      .filter(Boolean)

    if (checks.length === 0) return

    // 2. Diagnóstico: Buscar colisión en DB
    const conflict = await model.findFirst({ where: { OR: checks } })
    if (!conflict) return

    // 3. Mapear al error correcto del catálogo
    const resourceType = model.name || 'Resource' // Prisma suele tener model.name en runtime

    for (const context of contexts) {
      const field = context.name
      if (Array.isArray(field)) {
        // Caso: Campo Compuesto (@@unique)
        const isMatch = field.every((f) => equals(conflict[f], input[f], context.equals))
        if (isMatch) {
          // Usamos 'multipleUniqueConflicts' para compuestos
          throw apiErrors.multipleUniqueConflicts(
            resourceType,
            field.map((f) => ({ field: f, value: input[f] }))
          )
        }
      }

      if (typeof field !== 'string') {
        throw apiErrors.internalError(
          `Invalid field type in checkUnique strategy for model ${model.name}`
        )
      }

      // Caso: Campo Simple
      if (!areSameType(conflict[field], input[field])) {
        console.log(
          `Type mismatch on field ${field}: conflict is`,
          typeof conflict[field],
          'input is',
          typeof input[field]
        )
        throw apiErrors.internalError(`db_type_mismatch_${model.name}_${field}}`)
      }

      if (equals(conflict[field], input[field], context.equals)) {
        if (context.launchCustomException) {
          context.launchCustomException({ resourceType, field, value: input[field].toString() })
        }
        // Caso Genérico
        throw apiErrors.alreadyExists(resourceType, field, input[field].toString())
      }
    }
  }
}

// --- ESTRATEGIA: FOREIGN KEY (P2003 - Input Inválido) ---
export function checkFK(fields: string[]): Strategy {
  return (error, _model, input) => {
    if (error.code !== 'P2003') return

    // Intentamos obtener el campo de meta, o inferimos del input
    const metaField = error.meta?.field_name as string

    let culprit =
      metaField && fields.includes(metaField)
        ? metaField
        : fields.find((f) => input[f] !== undefined)

    if (culprit) {
      // Usamos validationError porque el ID enviado no es válido
      throw apiErrors.validationError([
        {
          field: culprit,
          message: `The referenced ${culprit} does not exist.`,
        },
      ])
    }
  }
}

// --- ESTRATEGIA: DELETE RESTRICT (P2003 - Recurso en Uso) ---
// Pensado para onDelete: Restrict
export function checkDeleteRestrict(resourceType: string): Strategy {
  return (error, _model, input) => {
    // input aquí será el objeto 'where'
    if (error.code === 'P2003') {
      // Intentamos sacar el ID del input (que es el where)
      const id = input.id || 'unknown'

      throw apiErrors.resourceInUse(
        resourceType,
        id,
        {},
        'Cannot delete because it has dependent records.'
      )
    }
  }
}
