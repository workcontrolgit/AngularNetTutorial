import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
  Position,
  CreatePositionCommand,
  UpdatePositionCommand,
  InsertMockPositionCommand,
  PagedResponse,
  QueryParams,
} from '../../models';
import { BaseApiService } from './base-api.service';

/**
 * Position API Service
 */
@Injectable({
  providedIn: 'root',
})
export class PositionService extends BaseApiService<Position> {
  protected readonly endpoint = 'Positions';

  /**
   * Create new position
   */
  createPosition(command: CreatePositionCommand): Observable<Position> {
    return this.create(command);
  }

  /**
   * Update existing position
   */
  updatePosition(command: UpdatePositionCommand): Observable<void> {
    return this.update(command.id, command);
  }

  /**
   * Get paged list of positions with search filters
   */
  getAllPaged(params?: QueryParams): Observable<PagedResponse<Position>> {
    const httpParams = this.buildHttpParams(params);
    return this.http.get<PagedResponse<Position>>(`${this.apiUrl}/${this.endpoint}`, { params: httpParams });
  }

  /**
   * Add mock positions for testing
   */
  addMockPositions(command: InsertMockPositionCommand): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${this.endpoint}/AddMock`, command);
  }
}
