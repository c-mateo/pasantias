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

if (!env.get('RATE_LIMITING_ENABLED', true)) {
  limiter.noLimit()
}

export const throttle = limiter.define('global', () => {
  return limiter.allowRequests(10).every('1 minute')
})

// Specific limiter for password forgot endpoint: 5 requests per hour
export const forgot = limiter.define('forgot', () => {
  // default key is IP — block for 1 hour on exhaustion to slow down abuse
  return limiter.allowRequests(5).every('1 hour').blockFor('1 hour')
})

// Auth limiter (login/register) - moderate rate per IP
export const auth = limiter.define('auth', () => {
  // allow small bursts but block for some time if abused
  return limiter.allowRequests(10).every('1 minute').blockFor('30 mins')
})

// Reset limiter (consuming tokens) - protect public token consumption endpoints
export const reset = limiter.define('reset', () => {
  return limiter.allowRequests(10).every('1 hour').blockFor('1 hour')
})

// Profile limiter (authenticated user actions such as email change / password change)
export const profile = limiter.define('profile', () => {
  // default is IP-based; choose a conservative window to protect sensitive actions
  return limiter.allowRequests(5).every('10 minutes').blockFor('30 mins')
})

// Admin limiter - more generous but still limited
export const admin = limiter.define('admin', () => {
  return limiter.allowRequests(50).every('1 hour')
})
