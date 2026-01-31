/**
 * Department entity
 */
export interface Department {
  id: string;
  name: string;
  createdAt?: string;
  lastModifiedAt?: string;
}

/**
 * Create Department Command
 */
export interface CreateDepartmentCommand {
  name: string;
}

/**
 * Update Department Command
 */
export interface UpdateDepartmentCommand {
  id: string;
  name: string;
}
