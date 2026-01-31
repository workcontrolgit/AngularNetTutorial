import { Gender } from './gender.enum';
import { Department } from './department.model';
import { Position } from './position.model';
import { SalaryRange } from './salary-range.model';

/**
 * Employee entity
 */
export interface Employee {
  id: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  prefix?: string;
  suffix?: string;
  email: string;
  phoneNumber?: string;
  phone?: string;
  employeeNumber: string;
  positionId: string;
  positionTitle?: string;
  departmentId: string;
  departmentName?: string;
  salaryRangeId?: string;
  salary: number;
  dateOfBirth?: string;
  birthday?: string;
  hireDate?: string;
  address?: string;
  gender: Gender;
  department?: Department;
  position?: Position;
  salaryRange?: SalaryRange;
  createdAt?: string;
  lastModifiedAt?: string;
}

/**
 * Create Employee Command
 */
export interface CreateEmployeeCommand {
  employeeNumber: string;
  prefix?: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  birthday: string;
  gender: Gender;
  email: string;
  phone: string;
  salary: number;
  positionId: string;
  departmentId: string;
}

/**
 * Update Employee Command
 */
export interface UpdateEmployeeCommand {
  id: string;
  employeeNumber: string;
  prefix?: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  birthday: string;
  gender: Gender;
  email: string;
  phone: string;
  salary: number;
  positionId: string;
  departmentId: string;
}
