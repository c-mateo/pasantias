import type { IAPIClient } from './IAPIClient'
import type { UsersListResponse, UserResponse, UserDTO } from './types'
import { BaseRepository } from './baseRepository'

export class UsersRepository extends BaseRepository<UserResponse['data'], any, any, UsersListResponse> {
  constructor(client: IAPIClient) { super(client, 'users') }

  // TODO: Evaluar si implementar de otra forma
  override create(payload: any): Promise<UserDTO> {
    throw new Error('Method not implemented.')
  }

  override update(id: number, payload: any): Promise<UserDTO> {
    throw new Error('Method not implemented.')
  }
}
