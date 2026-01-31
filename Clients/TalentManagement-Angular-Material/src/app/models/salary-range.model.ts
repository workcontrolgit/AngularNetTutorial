/**
 * Salary Range entity
 */
export interface SalaryRange {
  id: string;
  name: string;
  minSalary: number;
  maxSalary: number;
  createdAt?: string;
  lastModifiedAt?: string;
}

/**
 * Create Salary Range Command
 */
export interface CreateSalaryRangeCommand {
  name: string;
  minSalary: number;
  maxSalary: number;
}

/**
 * Update Salary Range Command
 */
export interface UpdateSalaryRangeCommand {
  id: string;
  name: string;
  minSalary: number;
  maxSalary: number;
}
