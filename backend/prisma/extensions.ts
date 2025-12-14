import { apiErrors } from '#exceptions/my_exceptions'
import { Prisma } from '../generated/prisma/client.js'
import { ErrorStrategy, executeGuarded } from './guard.js'

export const guardModelExtension = Prisma.defineExtension({
  name: 'Guarded Model Extension',
  model: {
    $allModels: {
      //   async createIfNotExists<T, A>(
      //     this: T,
      //     args: Prisma.Exact<A, Prisma.Args<T, 'create'>>
      //   ): Promise<Prisma.Result<T, A, 'create'>> {
      //     const ctx = Prisma.getExtensionContext(this);
      //     try {
      //       return await (ctx as any).create(args);
      //     } catch (error) {
      //       // return null;
      //       return await (ctx as any).findUnique({ where: (args as any).data });
      //     }
      //   },
      // Find unique or throw custom error
      async findUniqueOrThrow<T, A>(
        this: T,
        args: Prisma.Exact<A, Prisma.Args<T, 'findUniqueOrThrow'>>
      ): Promise<Prisma.Result<T, A, 'findUniqueOrThrow'>> {
        const ctx = Prisma.getExtensionContext(this)
        const result = await (ctx as any).findUnique(args)
        if (!result) {
          throw apiErrors.notFound((ctx as any).$name, (args as any).where?.id)
        }
        return result
      },

      /**
       * Create con manejo automático de errores RFC 9457
       */
      async guardedCreate<T, A>(
        this: T,
        args: Prisma.Exact<A, Prisma.Args<T, 'create'>>,
        strategies: ErrorStrategy[] = []
      ): Promise<Prisma.Result<T, A, 'create'>> {
        const ctx = Prisma.getExtensionContext(this)
        return executeGuarded(
          () => (ctx as any).create(args),
          ctx, // El contexto actúa como el modelo (prisma.user)
          args,
          strategies
        ) as any
      },

      /**
       * Update con manejo automático de errores
       */
      async guardedUpdate<T, A>(
        this: T,
        args: Prisma.Exact<A, Prisma.Args<T, 'update'>>,
        strategies: ErrorStrategy[] = []
      ): Promise<Prisma.Result<T, A, 'update'>> {
        const ctx = Prisma.getExtensionContext(this)
        return executeGuarded(() => (ctx as any).update(args), ctx, args, strategies) as any
      },

      /**
       * Delete con manejo automático de errores
       */
      async guardedDelete<T, A>(
        this: T,
        args: Prisma.Exact<A, Prisma.Args<T, 'delete'>>,
        strategies: ErrorStrategy[] = []
      ): Promise<Prisma.Result<T, A, 'delete'>> {
        const ctx = Prisma.getExtensionContext(this)
        return executeGuarded(() => (ctx as any).delete(args), ctx, args, strategies) as any
      },
    },
  },
})

type PaginationContext<T, A> = {
  // data: CleanPrismaResult<T, A> // Aquí usamos el tipo limpio
  data: Prisma.Result<T, A, 'findMany'>
  pagination: {
    limit: number
    next: number | string | null
    hasNext: boolean
  }
}

export const paginationExtension = Prisma.defineExtension({
  name: 'simplePagination',
  model: {
    $allModels: {
      async paginate<T, A, R>(
        this: T,
        args: Omit<Prisma.Args<T, 'findMany'>, 'skip' | 'take'> & {
          limit?: number
          after?: number | string
          extra?: (ctx: PaginationContext<T, A>) => R
        }
      ): Promise<PaginationContext<T, A> & R> {
        const { limit = 20, after, extra, ...rest } = args as any

        const model = Prisma.getExtensionContext(this)
        const cursor = after ? { id: after } : undefined

        const items = await (model as any).findMany({
          cursor,
          take: limit + 1,
          ...rest,
        })

        const hasNext = items.length > limit
        const next = hasNext ? items[limit].id : null

        if (hasNext) items.length = limit

        const base = {
          data: items,
          pagination: {
            limit,
            next,
            hasNext,
          },
        }

        const extraResult = extra ? extra(base) : {}

        return {
          ...base,
          ...(extraResult as any),
        }
      },
    },
  },
})
