import type { IAPIClient } from "./IAPIClient";
import type { Paginated } from "./types";

// Tipo único para list/getAll
export interface ListParams {
  limit?: number;
  after?: number;
  filter?: string; // FIQL
  order?: string;  // "field" o "-field"
}

export class BaseRepository<
  TGet = any,
  TCreate = any,
  TUpdate = any,
  TListResponse extends Paginated<any> = Paginated<TGet>
> {
  constructor(protected client: IAPIClient, protected endpoint: string) {}

  async getAll(params?: ListParams): Promise<TGet[]> {
    const all: TGet[] = [];
    let next = params?.after ?? 0;

    while (true) {
      const response = await this.list({ ...params, after: next });
      all.push(...response.data);
      if (!response.pagination?.hasNext) break;
      next = response.pagination.next!;
    }

    return all;
  }

  async list(params?: ListParams): Promise<TListResponse> {
    return this.client.get<TListResponse>(this.endpoint, { params });
  }

  async get(id: number): Promise<TGet> {
    return this.client.get<TGet>(`${this.endpoint}/${id}`);
  }

  async create(payload: TCreate): Promise<TGet> {
    return this.client.post<TGet, TCreate>(this.endpoint, payload);
  }

  async update(id: number, payload: TUpdate): Promise<TGet> {
    return this.client.patch<TGet, TUpdate>(`${this.endpoint}/${id}`, payload);
  }

  async delete(id: number): Promise<void> {
    return this.client.delete<void>(`${this.endpoint}/${id}`);
  }
}