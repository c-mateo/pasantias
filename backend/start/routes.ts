/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'
import { middleware } from './kernel.js'
import { UserRole } from '@prisma/client'

router.get('/', async () => {
  return {
    hello: 'world',
  }
})

// const coursesController = () => import('#controllers/courses_controller')
// router.get('courses', [coursesController, 'index'])
router.group(() => {
  router.group(() => {
    router.post('login', '#controllers/auth_controller.login').use(middleware.guest())
    router.post('logout', '#controllers/auth_controller.logout').use(middleware.auth())
    router.post('register', '#controllers/auth_controller.register').use(middleware.guest())
  }).prefix('/auth')

  // Non-admin routes
  router.get('profile', '#controllers/profile_controller.get').use(middleware.auth())

  router.get('courses', '#controllers/course_controller.list')
  router.get('courses/:id', '#controllers/course_controller.get')

  router.get('companies', '#controllers/company_controller.list')
  router.get('companies/:id', '#controllers/company_controller.get')
  router.get('companies/:id/offers', '#controllers/company_controller.getOffers')

  router.group(() => {
    router.get('my-applications', '#controllers/application_controller.listUserApplications')

    router.get('documents', '#controllers/document_controller.list')
    router.get('documents/:id', '#controllers/document_controller.get')
    router.post('documents', '#controllers/document_controller.upload')
    router.delete('documents/:id', '#controllers/document_controller.delete')
  }).use(middleware.auth())

  // Admin routes
  router.group(() => {
    router.post('courses', '#controllers/course_controller.create')
    router.patch('courses/:id', '#controllers/course_controller.update')
    router.delete('courses/:id', '#controllers/course_controller.delete')

    router.post('companies', '#controllers/company_controller.create')
    router.patch('companies/:id', '#controllers/company_controller.update')
    router.delete('companies/:id', '#controllers/company_controller.delete')

    router.post('offers', '#controllers/offer_controller.create')
    router.patch('offers/:id', '#controllers/offer_controller.update')
    router.delete('offers/:id', '#controllers/offer_controller.delete')

    // router.get('applications', '#controllers/application_controller.listAllApplications')
    // router.patch('applications/:id/status', '#controllers/application_controller.updateStatus')
  }).prefix('/admin').use(middleware.hasRole({ role: UserRole.ADMIN }))
}).prefix('/api/v1')