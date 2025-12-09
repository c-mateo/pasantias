import { AxiosAPIClient } from './AxiosAPIClient'
import { CompanyRepository } from './companies'
import { AuthRepository } from './auth'
import { ProfileRepository } from './profile'
import { OffersRepository } from './offers'
import { DraftsRepository } from './drafts'
import { MyDocumentsRepository } from './myDocuments'
import { SkillsRepository } from './skills'
import { ApplicationsRepository } from './applications'
import { UsersRepository } from './users'
import { NotificationsRepository } from './notifications'
import { CoursesRepository } from './courses'

export function buildClient(baseURL = 'http://localhost:5173/api/v1') {
    const client = new AxiosAPIClient(baseURL)

    return {
        companies: new CompanyRepository(client),
        auth: new AuthRepository(client),
        profile: new ProfileRepository(client),
        courses: new CoursesRepository(client),
        offers: new OffersRepository(client),
        drafts: new DraftsRepository(client),
        myDocuments: new MyDocumentsRepository(client),
        skills: new SkillsRepository(client),
        applications: new ApplicationsRepository(client),
        users: new UsersRepository(client),
        notifications: new NotificationsRepository(client),
    }
}

export type ApiClient = ReturnType<typeof buildClient>

// Default client for quick usage in app code (optional)
export const defaultApi = buildClient()
