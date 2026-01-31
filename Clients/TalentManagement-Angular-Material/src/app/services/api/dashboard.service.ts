import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { DashboardMetrics } from '../../models';
import { BaseApiService } from './base-api.service';
import { ApiResponse } from '../../models/common.model';

/**
 * Dashboard API Service
 */
@Injectable({
  providedIn: 'root',
})
export class DashboardService extends BaseApiService<DashboardMetrics> {
  protected readonly endpoint = 'Dashboard';

  /**
   * Get dashboard metrics
   */
  getDashboardMetrics(): Observable<DashboardMetrics> {
    return this.http
      .get<ApiResponse<DashboardMetrics>>(`${this.apiUrl}/${this.endpoint}/Metrics`)
      .pipe(
        map(response => {
          if (response.isSuccess && response.value) {
            return response.value;
          }
          throw new Error(response.message || 'Failed to load dashboard metrics');
        })
      );
  }
}
