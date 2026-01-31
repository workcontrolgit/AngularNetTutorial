/**
 * Dashboard Metrics Models
 */

export interface DashboardMetrics {
  totalEmployees: number;
  totalDepartments: number;
  totalPositions: number;
  totalSalaryRanges: number;
  newHiresThisMonth: number;
  averageSalary: number;
  employeesByDepartment: DepartmentMetric[];
  employeesByPosition: PositionMetric[];
  employeesBySalaryRange: SalaryRangeMetric[];
  genderDistribution: GenderMetric;
  recentEmployees: RecentEmployee[];
}

export interface DepartmentMetric {
  departmentId: string;
  departmentName: string;
  employeeCount: number;
}

export interface PositionMetric {
  positionId: string;
  positionTitle: string;
  employeeCount: number;
}

export interface SalaryRangeMetric {
  salaryRangeId: string;
  rangeName: string;
  minSalary: number;
  maxSalary: number;
  employeeCount: number;
}

export interface GenderMetric {
  male: number;
  female: number;
}

export interface RecentEmployee {
  id: string;
  fullName: string;
  positionTitle: string;
  departmentName: string;
  createdAt: string;
}
