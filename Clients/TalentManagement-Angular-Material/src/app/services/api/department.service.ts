import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
  Department,
  CreateDepartmentCommand,
  UpdateDepartmentCommand,
} from '../../models';
import { BaseApiService } from './base-api.service';

/**
 * Department API Service
 */
@Injectable({
  providedIn: 'root',
})
export class DepartmentService extends BaseApiService<Department> {
  protected readonly endpoint = 'Departments';

  /**
   * Create new department
   */
  createDepartment(command: CreateDepartmentCommand): Observable<Department> {
    return this.create(command);
  }

  /**
   * Update existing department
   */
  updateDepartment(command: UpdateDepartmentCommand): Observable<void> {
    return this.update(command.id, command);
  }
}
