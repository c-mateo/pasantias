import { apiErrors } from '#exceptions/my_exceptions'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/client'

type PublicKeys<T> = {
  [K in keyof T]: K extends `$${string}` ? never : K
}[keyof T]

type GuardSetup = {
  model: any
  input: any
  strategies: Array<(e: any, m: any, i: any) => any>
}

export async function guard<T>(operation: () => Promise<T>, guardSetup: GuardSetup): Promise<T> {
  const { input, model, strategies } = guardSetup
  try {
    return await operation()
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError) {
      // Ejecutar estrategias de diagnóstico
      for (const strategy of strategies) {
        await strategy(error, model, input)
      }

      // Fallback para errores de Prisma no manejados (ej: conexión)
      console.error('Unhandled DB Error:', error)
      throw apiErrors.internalError(`db_${error.code}_${Date.now().toString(36)}`)
    }
    throw error // Relanzar errores que no son de Prisma
  }
}

// Definimos el tipo de una Estrategia
export type ErrorStrategy = (
  error: PrismaClientKnownRequestError,
  model: any,
  args: any
) => Promise<void> | void

// Función genérica para ejecutar operaciones con manejo de errores Prisma y producir errores personalizados
// Se maneja P2025 (Not Found) por defecto
export async function executeGuarded<T>(
  operation: () => Promise<T>,
  model: any,
  args: any,
  strategies: ErrorStrategy[]
): Promise<T> {
  try {
    return await operation()
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError) {
      console.log('executeGuarded caught error:', error.code, 'args:', args)
      const inputContext = args.data || args.where || args

      // 1. Ejecutar estrategias específicas (para P2002, P2003, etc.)
      for (const strategy of strategies) {
        await strategy(error, model, inputContext)
      }

      // 2. Manejo GLOBAL de Not Found (P2025)
      // Esto cubre update() y delete() cuando el ID no existe.
      if (error.code === 'P2025') {
        // args.where.id suele estar disponible en delete/update
        const id = args.where?.id || 'unknown'
        const resourceType = model.$name || 'Resource'

        throw apiErrors.notFound(resourceType, id)
      }

      // 3. Fallback 500
      console.error('Unhandled Prisma Error:', error)
      throw apiErrors.internalError(`db_${error.code}`)
    }
    throw error
  }
}
