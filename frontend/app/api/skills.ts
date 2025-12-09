import type { IAPIClient } from './IAPIClient'
import type { SkillsListResponse, SkillResponse, SkillDTO, SkillCreateRequest, SkillUpdateRequest } from './types'
import { BaseRepository } from './baseRepository'

export class SkillsRepository extends BaseRepository<SkillDTO, SkillCreateRequest, SkillUpdateRequest, SkillsListResponse> {
  constructor(client: IAPIClient) { super(client, 'skills') }

   //  TODO: add params to base delete
  async deleteSkill(skillId: number, force = false): Promise<void> {
    // adapt: if force provided, we still support query param
    return this.client.delete<void>(`skills/${skillId}`, { params: { force } })
  }
}
