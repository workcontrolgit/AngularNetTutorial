import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
  Employee,
  CreateEmployeeCommand,
  UpdateEmployeeCommand,
  PagedResponse,
  PaginationParams,
} from '../../models';
import { BaseApiService } from './base-api.service';

/**
 * Employee API Service
 */
@Injectable({
  providedIn: 'root',
})
export class EmployeeService extends BaseApiService<Employee> {
  protected readonly endpoint = 'Employees';

  /**
   * Create new employee
   */
  createEmployee(command: CreateEmployeeCommand): Observable<Employee> {
    return this.create(command);
  }

  /**
   * Update existing employee
   */
  updateEmployee(command: UpdateEmployeeCommand): Observable<void> {
    return this.update(command.id, command);
  }
}
