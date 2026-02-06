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
import { auth, forgot, reset, profile, admin } from '#start/limiter'
import { UserRole } from '@prisma/client'
import SendTemplatedEmail from '#jobs/send_templated_email'
import CreateNotifications from '#jobs/create_notifications'
import { notifyUser } from '#services/notification_service'
import transmit from '@adonisjs/transmit/services/main'

transmit.registerRoutes()

router.post('/test', async () => {
  await CreateNotifications.dispatch({
    users: [1],
    title: 'Postulación aceptada',
    message: 'Tu postulación #1 fue aceptada.',
    tag: 'application',
  }).catch((err) => {
    console.error('CreateNotifications error', err)
  })
  // Send email using templated email job

  // await SendTemplatedEmail.dispatch({
  //   to: 'mateo.cerri.ar@gmail.com',
  //   template: 'application_accepted',
  //   data: {
  //     name: 'Mateo',
  //     applicationId: 1,
  //     offerPosition: 'Ingeniero',
  //     appUrl: 'http://127.0.0.1:5173/admin/aplicaciones/1',
  //   },
  // }).catch((err) => console.error('SendTemplatedEmail error', err))
})

router.post('/notifications/test', async ({ request, response }) => {
  // const userId = auth.user?.id
  // if (!userId) return response.unauthorized()

  // console.log('Sending test notification to user', 1, 'with payload')
  await notifyUser(1, {
    title: 'Notificación de prueba',
    message: 'Esta es una notificación de prueba.',
  })

  return response.accepted({ data: { sent: true } })
})

router
  .group(() => {
    router
      .group(() => {
        router
          .post('login', '#controllers/auth_controller.login')
          .as('auth.login')
          .use(middleware.guest())
          .use(auth)
        router
          .post('logout', '#controllers/auth_controller.logout')
          .as('auth.logout')
          .use(middleware.auth())
        router
          .post('register', '#controllers/auth_controller.register')
          .as('auth.register')
          .use(middleware.guest())
          .use(auth)
        router
          .post('password/forgot', '#controllers/auth_controller.forgotPassword')
          .as('auth.password.forgot')
          .use(middleware.guest())
          .use(forgot)
        router
          .post('password/reset', '#controllers/auth_controller.resetPassword')
          .as('auth.password.reset')
          .use(middleware.guest())
          .use(reset)
      })
      .prefix('/auth')

    // Non-admin routes
    router
      .group(() => {
        router.get('profile', '#controllers/profile_controller.get').as('profile')
        router.patch('profile', '#controllers/profile_controller.update')
        router.post('profile/change-email', '#controllers/profile_controller.requestEmailChange')
        router.post('profile/set-cuil', '#controllers/profile_controller.setCuil')
        router
          .post('profile/change-password', '#controllers/profile_controller.changePassword')
          .as('profile.changePassword')

        // Notifications
        router
          .get('notifications', '#controllers/notifications_controller.list')
          .as('notifications')
        router.get('notifications/:id', '#controllers/notifications_controller.get')
        router.patch(
          'notifications/:id/mark-as-read',
          '#controllers/notifications_controller.markAsRead'
        )
        router.delete('notifications/:id', '#controllers/notifications_controller.delete')
      })
      .use(middleware.auth())
      .use(profile)

    router.post('profile/verify', '#controllers/profile_controller.verify').use(reset)
    router
      .post('profile/email/confirm', '#controllers/profile_controller.confirmEmailChange')
      .use(reset)

    // Courses
    router.get('courses', '#controllers/course_controller.list').as('courses')
    router.get('courses/:id', '#controllers/course_controller.get')

    // Companies
    router.get('companies', '#controllers/company_controller.list').as('companies')
    router.get('companies/:id', '#controllers/company_controller.get')
    router
      .get('companies/:id/offers', '#controllers/company_controller.getOffers')
      .as('companies.offers')

    // Offers
    router.get('offers', '#controllers/offer_controller.list').as('offers')
    router.get('offers/:id', '#controllers/offer_controller.get').as('getOffer')

    // Document types (public)
    router.get('document-types', '#controllers/document_type_controller.list').as('documentTypes')
    router
      .get('document-types/:id', '#controllers/document_type_controller.get')
      .as('getDocumentType')

    // Draft management
    router.get('offers/:offerId/draft', '#controllers/draft_controller.get').use(middleware.auth())
    router
      .patch('offers/:offerId/draft', '#controllers/draft_controller.save')
      .use(middleware.auth())
    router
      .post('offers/:offerId/draft/submit', '#controllers/draft_controller.submit')
      .use(middleware.auth())

    // Draft document management
    router
      .put(
        'offers/:offerId/draft/documents/:reqDocId',
        '#controllers/draft_controller.uploadDocument'
      )
      .use(middleware.auth())
    router
      .delete(
        'offers/:offerId/draft/documents/:attachmentId',
        '#controllers/draft_controller.removeDocument'
      )
      .use(middleware.auth())
    router
      .post(
        'offers/:offerId/draft/documents/use-existing',
        '#controllers/draft_controller.useExistingDocument'
      )
      .use(middleware.auth())
    router
      .delete('offers/:offerId/draft', '#controllers/draft_controller.clear')
      .use(middleware.auth())

    router.get('skills', '#controllers/skill_controller.list').as('skills')
    router.get('skills/:id', '#controllers/skill_controller.get').as('getSkill')

    router
      .group(() => {
        router
          .get('my-applications', '#controllers/application_controller.listUser')
          .as('my-applications')
        router
          .get('my-applications/:id', '#controllers/application_controller.get')
          .as('my-applications.get')
        router
          .delete('my-applications/:id', '#controllers/application_controller.delete')
          .as('my-applications.delete')
        router.get('my-drafts', '#controllers/draft_controller.listUser').as('my-drafts')

        router.get('my-documents', '#controllers/my_document_controller.list').as('my-documents')
        router
          .get('my-documents/:id', '#controllers/my_document_controller.get')
          .as('my-documents.get')
        router.delete('my-documents/:id', '#controllers/my_document_controller.hide')
        router.post('my-documents/:id/download', '#controllers/my_document_controller.download')
      })
      .use(middleware.auth())

    // Admin routes
    router
      .group(() => {
        router.get('applications', '#controllers/application_controller.listAdmin')
        router.get('applications/:id', '#controllers/application_controller.get')
        router.patch('applications/:id/status', '#controllers/application_controller.updateStatus')

        router.post('courses', '#controllers/course_controller.create').as('createCourse')
        router.patch('courses/:id', '#controllers/course_controller.update').as('updateCourse')
        router.delete('courses/:id', '#controllers/course_controller.delete').as('deleteCourse')

        router.post('companies', '#controllers/company_controller.create').as('createCompany')
        router.patch('companies/:id', '#controllers/company_controller.update').as('updateCompany')
        router.delete('companies/:id', '#controllers/company_controller.delete').as('deleteCompany')

        // router
        //   .get('documents', '#controllers/document_controller.listAllDocuments')
        //   .as('listAllDocuments')
        // router
        //   .get('documents/:id', '#controllers/document_controller.getDocumentDetails')
        //   .as('getDocumentDetails')
        // router
        //   .delete('documents/:id', '#controllers/document_controller.deleteDocument')
        //   .as('deleteDocument')
        router
          .get('documents/:id', '#controllers/document_controller.downloadDocument')
          .as('downloadDocument')

        router.post('offers', '#controllers/offer_controller.create').as('createOffer')
        router.patch('offers/:id', '#controllers/offer_controller.update').as('updateOffer')
        router.delete('offers/:id', '#controllers/offer_controller.delete').as('deleteOffer')

        router.post('skills', '#controllers/skill_controller.create').as('createSkill')
        router.patch('skills/:id', '#controllers/skill_controller.update').as('updateSkill')
        router.delete('skills/:id', '#controllers/skill_controller.delete').as('deleteSkill')

        // Document types (admin)
        router
          .post('document-types', '#controllers/document_type_controller.create')
          .as('createDocumentType')
        router
          .patch('document-types/:id', '#controllers/document_type_controller.update')
          .as('updateDocumentType')
        router
          .delete('document-types/:id', '#controllers/document_type_controller.delete')
          .as('deleteDocumentType')

        router.get('users', '#controllers/user_controller.list')
        router.get('users/:id', '#controllers/user_controller.get')
        router.delete('users/:id', '#controllers/user_controller.delete')
        router.put('users/:id/cuil', '#controllers/user_controller.updateCuil')

        // Admin - broadcast notifications
        router
          .post('notifications/broadcast', '#controllers/notifications_controller.broadcast')
          .as('admin.notifications.broadcast')
      })
      .prefix('/admin')
      .use(middleware.hasRole({ role: UserRole.ADMIN }))
      .use(admin)
  })
  .prefix('/api/v1')
