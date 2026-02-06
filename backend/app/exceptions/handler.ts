import app from '@adonisjs/core/services/app'
import { HttpContext, ExceptionHandler } from '@adonisjs/core/http'
import { errors as AuthErrors } from '@adonisjs/auth'
import { errors as LimiterErrors } from '@adonisjs/limiter'
import { errors as VineErrors } from '@vinejs/vine'
import { apiErrors, ApiException } from './my_exceptions.js'

export default class HttpExceptionHandler extends ExceptionHandler {
  /**
   * In debug mode, the exception handler will display verbose errors
   * with pretty printed stack traces.
   */
  protected debug = !app.inProduction

  /**
   * The method is used for handling errors and returning
   * response to the client
   */
  async handle(error: any, ctx: HttpContext) {
    // Handle known framework errors and return sanitized API responses.
    if (error instanceof AuthErrors.E_UNAUTHORIZED_ACCESS) {
      const customError = apiErrors.sessionExpired('absolute')
      const formattedError = customError.format({ instance: ctx.request.url() })
      return ctx.response.status(formattedError.status).json(formattedError)
    }

    if (error instanceof LimiterErrors.E_TOO_MANY_REQUESTS) {
      // Return generic rate limit error (middleware doesn't expose limits here).
      const customError = apiErrors.rateLimitExceeded(
        error.response.limit,
        'unknown',
        error.response.availableIn
      )
      const formattedError = customError.format({ instance: ctx.request.url() })
      return ctx.response.status(formattedError.status).json(formattedError)
    }

    if (error instanceof VineErrors.E_VALIDATION_ERROR) {
      const customError = apiErrors.validationError(error.messages)
      const formattedError = customError.format({ instance: ctx.request.url() })
      return ctx.response.status(formattedError.status).json(formattedError)
    }

    // ApiException: return formatted payload
    if (error instanceof ApiException) {
      const formatted = (error as any).format({ instance: ctx.request.url() })
      return ctx.response.status(formatted.status).json(formatted)
    }

    // Map controller "missing method" runtime error to a sanitized 404
    if (typeof error?.message === 'string' && /Missing method\s+"/.test(error.message)) {
      const custom = apiErrors.notFound('endpoint', ctx.request.url())
      const formatted = custom.format({ instance: ctx.request.url() })
      return ctx.response.status(formatted.status).json(formatted)
    }

    // Unexpected errors: log and return sanitized 500 with an errorId
    const errorId = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
    console.error(`InternalError ${errorId}:`, error)
    const internal = apiErrors.internalError(errorId)
    const formattedInternal = internal.format({ instance: ctx.request.url() })
    return ctx.response.status(formattedInternal.status).json(formattedInternal)

    // Fallback: report and return sanitized 500 (handled above).
  }

  /**
   * The method is used to report error to the logging service or
   * the third party error monitoring service.
   *
   * @note You should not attempt to send a response from this method.
   */
  async report(error: unknown, ctx: HttpContext) {
    return super.report(error, ctx)
  }
}
