/*
|--------------------------------------------------------------------------
| Define HTTP limiters
|--------------------------------------------------------------------------
|
| The "limiter.define" method creates an HTTP middleware to apply rate
| limits on a route or a group of routes. Feel free to define as many
| throttle middleware as needed.
|
*/

import limiter from '@adonisjs/limiter/services/main'
import env from './env.js'
import { HttpContext } from '@adonisjs/core/http'

const enabledGlobally = env.get('RATE_LIMITING_ENABLED', true)

type BuilderType = Parameters<typeof limiter.define>[1]

// Wrapper
const define = (name: string, builder: BuilderType) => {
  const fun = enabledGlobally ? builder : (_: HttpContext) => limiter.noLimit()
  return limiter.define(name, fun)
}

export const throttle = define('global', () => {
  return limiter.allowRequests(10).every('1 minute')
})

// Specific limiter for password forgot endpoint: 5 requests per hour
export const forgot = define('forgot', () => {
  // default key is IP — block for 1 hour on exhaustion to slow down abuse
  return limiter.allowRequests(5).every('1 hour').blockFor('1 hour')
})

// Auth limiter (login/register) - moderate rate per IP
export const auth = define('auth', () => {
  // allow small bursts but block for some time if abused
  return limiter.allowRequests(10).every('1 minute').blockFor('30 mins')
})

// Reset limiter (consuming tokens) - protect public token consumption endpoints
export const reset = define('reset', () => {
  return limiter.allowRequests(10).every('1 hour').blockFor('1 hour')
})

// Profile limiter (authenticated user actions such as email change / password change)
export const profile = define('profile', () => {
  // default is IP-based; choose a conservative window to protect sensitive actions
  return limiter.allowRequests(5).every('10 minutes').blockFor('30 mins')
})

// Admin limiter - more generous but still limited
export const admin = define('admin', () => {
  return limiter.allowRequests(50).every('1 hour')
})
