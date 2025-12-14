import type { IAPIClient } from './IAPIClient'
import type { ProfileResponse, UpdateProfileResponse, UpdateProfileRequest } from './types'

export class ProfileRepository {
  constructor(private client: IAPIClient) {}

  async getProfile(): Promise<ProfileResponse> {
    return this.client.get<ProfileResponse>('profile')
  }

  async updateProfile(payload: UpdateProfileRequest): Promise<UpdateProfileResponse> {
    return this.client.patch<UpdateProfileResponse, UpdateProfileRequest>('profile', payload)
  }

  async changeEmail(payload: { email: string }) {
    return this.client.patch<ChangeEmailResponse, { email: string }>('profile/email', payload)
  }

  async changePassword(payload: { currentPassword: string; newPassword: string }) {
    return this.client.post<ChangePasswordResponse, { currentPassword: string; newPassword: string }>('profile/change-password', payload)
  }
}
