import type { IAPIClient } from './IAPIClient'
import type { RegisterResponse, LoginResponse, NoContent, RegisterRequest, LoginRequest } from './types'

export class AuthRepository {
  constructor(private client: IAPIClient) {}

  async register(data: RegisterRequest): Promise<RegisterResponse> {
    return this.client.post<RegisterResponse, RegisterRequest>('auth/register', data)
  }

  async login(data: LoginRequest): Promise<LoginResponse> {
    return this.client.post<LoginResponse, LoginRequest>('auth/login', data)
  }

  async logout(): Promise<NoContent> {
    return this.client.post<NoContent>('auth/logout')
  }
}
