// api/AxiosAPIClient.ts
import axios, { type AxiosInstance } from 'axios';
import type { IAPIClient, IRequestOptions } from './IAPIClient';

export class AxiosAPIClient implements IAPIClient {
  private axiosInstance: AxiosInstance;

  constructor(baseURL: string, defaultHeaders: Record<string, string> = {}) {
    this.axiosInstance = axios.create({
      baseURL,
      withCredentials: true,
      headers: defaultHeaders,
    });

    // Interceptor de requests
    this.axiosInstance.interceptors.request.use(config => {
      // Por ejemplo, agregar token dinámicamente
      const token = localStorage.getItem('token');
      if (token) config.headers['Authorization'] = `Bearer ${token}`;
      return config;
    });

    // Interceptor de responses
    this.axiosInstance.interceptors.response.use(
      response => response,
      error => {
        console.error('API error:', error.response?.status, error.message);
        return Promise.reject(error);
      }
    );
  }

  async get<T>(endpoint: string, options?: IRequestOptions): Promise<T> {
    const { params, responseType, headers } = options ?? {}
    const { data } = await this.axiosInstance.get<T>(endpoint, {
      params,
      responseType: responseType as any,
      headers,
    });
    return data;
  }

  async post<T, B = any>(endpoint: string, body?: B, options?: IRequestOptions): Promise<T> {
    const { responseType, headers, params } = options ?? {}
    const { data } = await this.axiosInstance.post<T>(endpoint, body, { responseType: responseType as any, headers, params });
    return data;
  }

  async put<T, B = any>(endpoint: string, body?: B, options?: IRequestOptions): Promise<T> {
    const { responseType, headers, params } = options ?? {}
    const { data } = await this.axiosInstance.put<T>(endpoint, body, { responseType: responseType as any, headers, params });
    return data;
  }

  async patch<T, B = any>(endpoint: string, body?: B, options?: IRequestOptions): Promise<T> {
    const { responseType, headers, params } = options ?? {}
    const { data } = await this.axiosInstance.patch<T>(endpoint, body, { responseType: responseType as any, headers, params });
    return data;
  }

  async delete<T>(endpoint: string, options?: IRequestOptions): Promise<T> {
    const { params, responseType, headers } = options ?? {}
    const { data } = await this.axiosInstance.delete<T>(endpoint, { params, responseType: responseType as any, headers });
    return data;
  }
}
