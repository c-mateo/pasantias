// api/IAPIClient.ts
export type ResponseType = 'json' | 'blob' | 'arraybuffer'

export interface IRequestOptions {
  params?: Record<string, any>
  responseType?: ResponseType
  headers?: Record<string, string>
}

export interface IAPIClient {
  get<TRes>(endpoint: string, options?: IRequestOptions): Promise<TRes>
  post<TRes, TBody = any>(endpoint: string, body?: TBody, options?: IRequestOptions): Promise<TRes>
  put<TRes, TBody = any>(endpoint: string, body?: TBody, options?: IRequestOptions): Promise<TRes>
  patch<TRes, TBody = any>(endpoint: string, body?: TBody, options?: IRequestOptions): Promise<TRes>
  delete<TRes>(endpoint: string, options?: IRequestOptions): Promise<TRes>
}
