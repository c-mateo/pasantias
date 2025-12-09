import type { IAPIClient } from "./IAPIClient";
import type {
  CompaniesListResponse,
  CompanyDTO,
  CompanyResponse,
  CompanyCreateRequest,
  CompanyUpdateRequest,
} from "./types";
import { BaseRepository } from "./baseRepository";

export class CompanyRepository extends BaseRepository<
  CompanyDTO,
  CompanyCreateRequest,
  CompanyUpdateRequest,
  CompaniesListResponse
> {
  constructor(client: IAPIClient) {
    super(client, "companies");
  }
}
