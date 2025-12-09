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
}
