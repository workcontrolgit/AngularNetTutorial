import { HttpClient, HttpParams } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { PaginationParams, PagedResponse, QueryParams } from '../../models';

/**
 * Base API Service
 * Provides common HTTP methods for all entity services
 */
export abstract class BaseApiService<T> {
  protected http = inject(HttpClient);
  protected apiUrl = environment.apiUrl;

  /**
   * Abstract property for entity endpoint
   * Must be implemented by derived classes
   */
  protected abstract readonly endpoint: string;

  /**
   * Get list of entities
   */
  getAll(params?: QueryParams): Observable<T[]> {
    const httpParams = this.buildHttpParams(params);
    return this.http.get<PagedResponse<T>>(`${this.apiUrl}/${this.endpoint}`, { params: httpParams })
      .pipe(
        map(response => response.value)
      );
  }

  /**
   * Get paged list of entities with full response
   */
  getAllPaged(params?: QueryParams): Observable<PagedResponse<T>> {
    const httpParams = this.buildHttpParams(params);
    return this.http.get<PagedResponse<T>>(`${this.apiUrl}/${this.endpoint}`, { params: httpParams });
  }

  /**
   * Get entity by ID
   */
  getById(id: string): Observable<T> {
    return this.http.get<PagedResponse<T>>(`${this.apiUrl}/${this.endpoint}/${id}`)
      .pipe(
        map(response => response.value as T)
      );
  }

  /**
   * Create new entity
   */
  create(data: Partial<T>): Observable<T> {
    return this.http.post<any>(`${this.apiUrl}/${this.endpoint}`, data)
      .pipe(
        map(response => {
          // Handle wrapped response with value property containing the ID
          if (response && 'value' in response && typeof response.value === 'string') {
            // API returns { value: "guid-string" }
            return { id: response.value } as T;
          }
          // Handle normal entity response
          return response as T;
        })
      );
  }

  /**
   * Update existing entity
   */
  update(id: string, data: Partial<T>): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${this.endpoint}/${id}`, data);
  }

  /**
   * Delete entity
   */
  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${this.endpoint}/${id}`);
  }

  /**
   * Build HttpParams from query parameters
   */
  protected buildHttpParams(params?: QueryParams): HttpParams {
    let httpParams = new HttpParams();

    if (params) {
      Object.keys(params).forEach(key => {
        const value = params[key];
        if (value !== null && value !== undefined) {
          httpParams = httpParams.set(key, value.toString());
        }
      });
    }

    return httpParams;
  }
}
