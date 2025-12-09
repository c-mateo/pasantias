import type { IAPIClient } from "./IAPIClient";
import type {
  OffersListResponse,
  OfferResponse,
  OfferDTO,
  OfferDetailedDTO,
  OfferCreateRequest,
  OfferUpdateRequest,
} from "./types";
import { BaseRepository } from "./baseRepository";

export class OffersRepository extends BaseRepository<
  OfferDTO,
  OfferCreateRequest,
  OfferUpdateRequest,
  OffersListResponse
> {
  constructor(client: IAPIClient) {
    super(client, "offers");
  }

  async listByCompany(
    companyId: number,
    limit = 20,
    after = 0
  ): Promise<OffersListResponse> {
    return this.client.get<OffersListResponse>(
      `companies/${companyId}/offers`,
      { params: { limit, after } }
    );
  }
}
