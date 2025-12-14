import app from '@adonisjs/core/services/app'
import { HttpContext, ExceptionHandler } from '@adonisjs/core/http'
import { StatusPageRange } from '@adonisjs/core/types/http'
import { ValidationError } from '@vinejs/vine'
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
    // console.log("Handle", error)
    // if (error instanceof ValidationError) {
    //   if (error.messages.some((msg => msg.rule === 'exists'))) {
    //     return ctx.response.notFound({
    //       message: 'Resource not found',
    //     })
    //   }
    // }

    if (error.code === 'E_UNAUTHORIZED_ACCESS') {
      const customError = apiErrors.sessionExpired('absolute')
      const formattedError = customError.format({ instance: ctx.request.url() })
      return ctx.response.status(formattedError.status).json(formattedError)
    }

    console.log('Error handled by HttpExceptionHandler:', error)

    if (error instanceof ApiException) {
      const formattedError = error.format({ instance: ctx.request.url() })
      return ctx.response.status(formattedError.status).json(formattedError)
    }

    return super.handle(error, ctx)
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
