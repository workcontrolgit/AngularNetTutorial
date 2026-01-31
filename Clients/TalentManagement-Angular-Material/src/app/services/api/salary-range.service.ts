import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
  SalaryRange,
  CreateSalaryRangeCommand,
  UpdateSalaryRangeCommand,
} from '../../models';
import { BaseApiService } from './base-api.service';

/**
 * Salary Range API Service
 */
@Injectable({
  providedIn: 'root',
})
export class SalaryRangeService extends BaseApiService<SalaryRange> {
  protected readonly endpoint = 'SalaryRanges';

  /**
   * Create new salary range
   */
  createSalaryRange(command: CreateSalaryRangeCommand): Observable<SalaryRange> {
    return this.create(command);
  }

  /**
   * Update existing salary range
   */
  updateSalaryRange(command: UpdateSalaryRangeCommand): Observable<void> {
    return this.update(command.id, command);
  }
}
