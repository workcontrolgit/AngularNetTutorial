# Dashboard Implementation Plan

## Project Overview
Implement a comprehensive HR Dashboard for the Talent Management application that displays key metrics, visualizations, and quick actions for HR personnel.

---

## Phase 1: Backend API Enhancements (If Needed)

### 1.1 Dashboard Metrics Endpoint
**Objective**: Create a dedicated endpoint that returns all dashboard metrics in a single call

**API Endpoint**: `GET /api/v1/Dashboard/Metrics`

**Response Schema**:
```json
{
  "totalEmployees": 150,
  "totalDepartments": 8,
  "totalPositions": 45,
  "newHiresThisMonth": 5,
  "averageSalary": 75000,
  "employeesByDepartment": [
    { "departmentName": "Engineering", "count": 45 },
    { "departmentName": "Sales", "count": 30 }
  ],
  "employeesByPosition": [
    { "positionTitle": "Software Engineer", "count": 25 },
    { "positionTitle": "Sales Representative", "count": 20 }
  ],
  "employeesBySalaryRange": [
    { "rangeName": "$50k-$75k", "count": 50 },
    { "rangeName": "$75k-$100k", "count": 60 }
  ],
  "genderDistribution": {
    "male": 85,
    "female": 65
  },
  "recentEmployees": [
    {
      "id": "guid",
      "fullName": "John Doe",
      "positionTitle": "Software Engineer",
      "hireDate": "2025-01-15T00:00:00Z"
    }
  ]
}
```

**Alternative**: Use existing endpoints with small page sizes to get counts
- `GET /api/v1/Employees?pageSize=1` → use `recordsTotal`
- `GET /api/v1/Departments?pageSize=1` → use `recordsTotal`

---

## Phase 2: Frontend Models & Services

### 2.1 Create Dashboard Models
**File**: `talent-management/src/app/models/dashboard.model.ts`

```typescript
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
  hireDate: string;
}
```

### 2.2 Create Dashboard Service (Optional)
**File**: `talent-management/src/app/services/api/dashboard.service.ts`

```typescript
import { Injectable } from '@angular/core';
import { Observable, forkJoin, map } from 'rxjs';
import { DashboardMetrics } from '../../models/dashboard.model';
import { BaseApiService } from './base-api.service';

@Injectable({
  providedIn: 'root',
})
export class DashboardService extends BaseApiService<DashboardMetrics> {
  protected readonly endpoint = 'Dashboard';

  /**
   * Get dashboard metrics
   * Option 1: If backend has dedicated endpoint
   */
  getDashboardMetrics(): Observable<DashboardMetrics> {
    return this.http.get<DashboardMetrics>(`${this.apiUrl}/${this.endpoint}/Metrics`);
  }
}
```

**Alternative**: Aggregate data in the dashboard component using existing services

---

## Phase 3: Install Chart Library

### 3.1 Choose Chart Library
**Recommended**: **Chart.js** with **ng2-charts** (Angular wrapper)

**Why Chart.js?**
- Lightweight and performant
- Excellent Material Design integration
- Responsive and accessible
- Well-documented with Angular support
- Free and open-source

**Installation**:
```bash
npm install chart.js ng2-charts
```

**Alternative Options**:
- **ApexCharts** (more features, slightly heavier)
- **ngx-charts** (D3-based, highly customizable)
- **Material Charts** (if you want pure Material Design)

---

## Phase 4: Dashboard Component Implementation

### 4.1 Update Dashboard Component TypeScript
**File**: `talent-management/src/app/routes/dashboard/dashboard.ts`

**Key Features**:
- Inject required services (EmployeeService, DepartmentService, etc.)
- Load dashboard metrics on init
- Handle loading states with spinner
- Error handling with snackbar notifications
- Chart configuration for each visualization
- Role-based quick actions

**Structure**:
```typescript
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatListModule,
    BaseChartDirective, // from ng2-charts
    PageHeader,
    HasRoleDirective
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard implements OnInit {
  // Services
  private employeeService = inject(EmployeeService);
  private departmentService = inject(DepartmentService);
  private positionService = inject(PositionService);
  private salaryRangeService = inject(SalaryRangeService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  // State
  loading = true;

  // Metrics
  totalEmployees = 0;
  totalDepartments = 0;
  totalPositions = 0;
  totalSalaryRanges = 0;
  averageSalary = 0;

  // Chart Data
  departmentChartData: ChartData<'pie'>;
  positionChartData: ChartData<'bar'>;
  salaryChartData: ChartData<'bar'>;
  genderChartData: ChartData<'doughnut'>;

  // Recent Activity
  recentEmployees: Employee[] = [];

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    // Implementation
  }
}
```

### 4.2 Update Dashboard Template
**File**: `talent-management/src/app/routes/dashboard/dashboard.html`

**Layout Structure**:
```html
<page-header></page-header>

<!-- Loading Spinner -->
<div *ngIf="loading" class="loading-spinner">
  <mat-spinner></mat-spinner>
</div>

<!-- Dashboard Content -->
<div *ngIf="!loading" class="dashboard-container">

  <!-- Summary Metrics Cards (Row 1) -->
  <div class="metrics-row">
    <mat-card class="metric-card">
      <mat-card-header>
        <mat-icon>people</mat-icon>
      </mat-card-header>
      <mat-card-content>
        <div class="metric-value">{{ totalEmployees }}</div>
        <div class="metric-label">Total Employees</div>
      </mat-card-content>
    </mat-card>

    <!-- Repeat for other metrics -->
  </div>

  <!-- Charts Row -->
  <div class="charts-row">
    <!-- Department Distribution -->
    <mat-card class="chart-card">
      <mat-card-header>
        <mat-card-title>Employees by Department</mat-card-title>
      </mat-card-header>
      <mat-card-content>
        <canvas baseChart [data]="departmentChartData" type="pie"></canvas>
      </mat-card-content>
    </mat-card>

    <!-- Position Distribution -->
    <mat-card class="chart-card">
      <mat-card-header>
        <mat-card-title>Top Positions</mat-card-title>
      </mat-card-header>
      <mat-card-content>
        <canvas baseChart [data]="positionChartData" type="bar"></canvas>
      </mat-card-content>
    </mat-card>
  </div>

  <!-- Recent Activity -->
  <div class="activity-row">
    <mat-card>
      <mat-card-header>
        <mat-card-title>Recent Employees</mat-card-title>
      </mat-card-header>
      <mat-card-content>
        <mat-list>
          <!-- Employee list items -->
        </mat-list>
      </mat-card-content>
    </mat-card>
  </div>

  <!-- Quick Actions -->
  <div class="actions-row" *appHasRole="['HRAdmin', 'Manager']">
    <button mat-raised-button color="primary" (click)="navigateToAddEmployee()">
      <mat-icon>person_add</mat-icon>
      Add Employee
    </button>
    <!-- More action buttons -->
  </div>
</div>
```

### 4.3 Update Dashboard Styles
**File**: `talent-management/src/app/routes/dashboard/dashboard.scss`

**Key Styling**:
- CSS Grid layout for responsive dashboard
- Card styling with shadows and borders
- Chart container sizing
- Metric card styling with icons
- Responsive breakpoints for mobile

---

## Phase 5: Data Loading Strategy

### Option A: Aggregate from Existing Endpoints
**Pros**: No backend changes needed
**Cons**: Multiple HTTP requests

```typescript
loadDashboardData(): void {
  this.loading = true;

  forkJoin({
    employees: this.employeeService.getAllPaged({ pageSize: 1, pageNumber: 1 }),
    departments: this.departmentService.getAll(),
    positions: this.positionService.getAllPaged({ pageSize: 1, pageNumber: 1 }),
    salaryRanges: this.salaryRangeService.getAll(),
    recentEmployees: this.employeeService.getAllPaged({
      pageSize: 5,
      pageNumber: 1,
      orderBy: 'createdAt desc'
    })
  }).subscribe({
    next: (data) => {
      this.totalEmployees = data.employees.recordsTotal;
      this.totalDepartments = data.departments.length;
      this.totalPositions = data.positions.recordsTotal;
      this.totalSalaryRanges = data.salaryRanges.length;

      this.recentEmployees = data.recentEmployees.value;

      this.prepareChartData(data);
      this.loading = false;
    },
    error: (error) => {
      console.error('Error loading dashboard:', error);
      this.showMessage('Error loading dashboard data');
      this.loading = false;
    }
  });
}
```

### Option B: Dedicated Dashboard Endpoint
**Pros**: Single HTTP request, optimized query
**Cons**: Requires backend implementation

```typescript
loadDashboardData(): void {
  this.loading = true;

  this.dashboardService.getDashboardMetrics().subscribe({
    next: (metrics) => {
      this.totalEmployees = metrics.totalEmployees;
      this.totalDepartments = metrics.totalDepartments;
      // ... set other properties

      this.prepareChartData(metrics);
      this.loading = false;
    },
    error: (error) => {
      console.error('Error loading dashboard:', error);
      this.showMessage('Error loading dashboard data');
      this.loading = false;
    }
  });
}
```

---

## Phase 6: Chart Preparation

### 6.1 Sample Chart Configuration

```typescript
prepareDepartmentChart(departments: Department[], employees: Employee[]): void {
  // Group employees by department
  const deptCounts = new Map<string, number>();
  employees.forEach(emp => {
    const count = deptCounts.get(emp.departmentName) || 0;
    deptCounts.set(emp.departmentName, count + 1);
  });

  this.departmentChartData = {
    labels: Array.from(deptCounts.keys()),
    datasets: [{
      data: Array.from(deptCounts.values()),
      backgroundColor: [
        '#FF6384',
        '#36A2EB',
        '#FFCE56',
        '#4BC0C0',
        '#9966FF',
        '#FF9F40'
      ]
    }]
  };
}
```

---

## Phase 7: Testing & Refinement

### 7.1 Test Cases
- [ ] Dashboard loads successfully for all user roles
- [ ] All metrics display correct counts
- [ ] Charts render properly with real data
- [ ] Loading spinner shows during data fetch
- [ ] Error messages display when API fails
- [ ] Recent employees list shows latest 5 records
- [ ] Quick action buttons work and respect role permissions
- [ ] Dashboard is responsive on mobile/tablet
- [ ] Charts are accessible (screen reader support)
- [ ] Performance: Dashboard loads in < 2 seconds

### 7.2 Role-Based Testing
- **Guest**: Can view dashboard metrics (read-only)
- **Employee**: Can view dashboard metrics (read-only)
- **Manager**: Can view dashboard + quick actions for employees
- **HRAdmin**: Full access to all metrics and quick actions

---

## Phase 8: Future Enhancements

### 8.1 Advanced Features (Post-MVP)
- **Date Range Filters**: Filter metrics by date range (last 7 days, month, quarter, year)
- **Export to PDF/Excel**: Download dashboard report
- **Real-time Updates**: WebSocket for live metric updates
- **Drill-down**: Click chart segments to view detailed lists
- **Comparison View**: Compare current vs previous period
- **Custom Widgets**: User-configurable dashboard layout
- **Alerts/Notifications**: Show pending approvals, upcoming reviews
- **Department-Specific Dashboards**: Filter by department for managers

### 8.2 Additional Charts
- **Turnover Rate**: Employee retention metrics over time
- **Hiring Trends**: Line chart showing hiring over months
- **Position Vacancy Rate**: Filled vs vacant positions
- **Salary Trends**: Average salary by department or position
- **Experience Distribution**: Employee tenure breakdown

---

## Timeline Estimate

| Phase | Task | Estimated Time |
|-------|------|----------------|
| **Phase 1** | Backend API (if needed) | 4-8 hours |
| **Phase 2** | Models & Services | 2-3 hours |
| **Phase 3** | Install Chart Library | 1 hour |
| **Phase 4** | Dashboard Component | 6-8 hours |
| **Phase 5** | Data Loading | 3-4 hours |
| **Phase 6** | Chart Configuration | 4-6 hours |
| **Phase 7** | Testing & Refinement | 3-4 hours |
| **Total** | | **23-34 hours** |

---

## Priority Recommendation

### MVP (Phase 1 - Must Have)
1. **Summary Metric Cards** (Total Employees, Departments, Positions, Salary Ranges)
2. **Department Distribution Chart** (Pie chart)
3. **Recent Employees List** (Last 5 added)
4. **Quick Actions** (Add Employee, Add Department buttons)

### Phase 2 (Nice to Have)
5. **Position Distribution Chart** (Bar chart)
6. **Gender Distribution Chart** (Donut chart)
7. **Average Salary Metric**

### Phase 3 (Future)
8. **Salary Range Distribution Chart**
9. **Date Range Filters**
10. **Advanced Analytics**

---

## Technical Dependencies

### Required NPM Packages
```json
{
  "chart.js": "^4.4.0",
  "ng2-charts": "^6.0.0"
}
```

### Required Angular Modules
- CommonModule
- MatCardModule
- MatIconModule
- MatButtonModule
- MatProgressSpinnerModule
- MatListModule
- BaseChartDirective (from ng2-charts)

### Existing Services to Use
- EmployeeService
- DepartmentService
- PositionService
- SalaryRangeService
- OidcAuthService (for role checks)

---

## Design Mockup (Text Description)

```
+----------------------------------------------------------+
|                      DASHBOARD                           |
+----------------------------------------------------------+

+-------------+  +-------------+  +-------------+  +-------------+
|    👥       |  |    🏢       |  |    💼       |  |    💰       |
|    150      |  |     8       |  |    45       |  |     12      |
| Employees   |  | Departments |  | Positions   | | Sal. Ranges |
+-------------+  +-------------+  +-------------+  +-------------+

+---------------------------+  +---------------------------+
|  Employees by Department  |  |    Top 10 Positions      |
|                           |  |                           |
|      [Pie Chart]          |  |    [Horizontal Bars]      |
|                           |  |                           |
+---------------------------+  +---------------------------+

+---------------------------+  +---------------------------+
|  Gender Distribution      |  |  Salary Range Breakdown   |
|                           |  |                           |
|    [Donut Chart]          |  |      [Stacked Bars]       |
|                           |  |                           |
+---------------------------+  +---------------------------+

+----------------------------------------------------------+
|               Recent Employees (Last 5)                   |
| • John Doe - Software Engineer - Engineering - Jan 15     |
| • Jane Smith - Sales Rep - Sales - Jan 12                 |
| • Bob Johnson - Manager - Operations - Jan 10             |
+----------------------------------------------------------+

+----------------------------------------------------------+
|                    Quick Actions                          |
| [+ Add Employee] [+ Add Department] [+ Add Position]     |
+----------------------------------------------------------+
```

---

## Accessibility Considerations

1. **Chart Accessibility**:
   - Provide alternative text descriptions for charts
   - Use ARIA labels for chart containers
   - Ensure sufficient color contrast in charts
   - Provide data tables as alternatives to visual charts

2. **Keyboard Navigation**:
   - All interactive elements accessible via keyboard
   - Proper tab order through dashboard widgets

3. **Screen Reader Support**:
   - Semantic HTML structure
   - ARIA landmarks for dashboard sections
   - Descriptive labels for metrics

---

## Performance Optimization

1. **Lazy Loading**: Dashboard component already lazy-loaded via routing
2. **Caching**: Consider caching dashboard data for 5 minutes
3. **Pagination**: Recent employees limited to 5 items
4. **Chart Performance**: Use Canvas (Chart.js) instead of SVG for large datasets
5. **Loading States**: Show skeleton screens or spinners during data fetch

---

## Security Considerations

1. **Role-Based Access**: Dashboard visible to all authenticated users
2. **Data Filtering**: Managers see only their department data (future)
3. **API Authorization**: All API calls include Bearer token
4. **XSS Prevention**: Angular's built-in sanitization for chart labels
5. **CORS**: API properly configured for dashboard endpoints

---

## Success Metrics

### How to Measure Success
1. **Load Time**: Dashboard loads in < 2 seconds
2. **User Engagement**: Dashboard is accessed by 80%+ of users
3. **Accuracy**: Metrics match source data (employees, departments)
4. **Usability**: Users can understand metrics without training
5. **Performance**: No lag when rendering charts with 1000+ employees

---

## Next Steps

1. **Review & Approve**: Stakeholder review of dashboard plan
2. **Backend Coordination**: Confirm if dedicated endpoint will be created
3. **Design Approval**: Confirm color scheme, chart types, layout
4. **Sprint Planning**: Allocate story points and assign tasks
5. **Development**: Begin implementation following this plan

---

## Questions to Resolve

1. Does the backend team need to create a dedicated Dashboard/Metrics endpoint?
2. What is the preferred chart library (Chart.js, ApexCharts, ngx-charts)?
3. Should the dashboard support date range filtering in MVP or Phase 2?
4. What additional metrics are most important to HR stakeholders?
5. Should managers see company-wide data or only their department?
6. Do we need to track "New Hires This Month" on backend or calculate client-side?
7. What is the desired refresh interval for dashboard data (manual, auto-refresh)?

---

## Resources

### Chart.js Documentation
- Official Docs: https://www.chartjs.org/docs/latest/
- ng2-charts: https://valor-software.com/ng2-charts/

### Material Design Guidelines
- Cards: https://material.angular.io/components/card/
- Icons: https://fonts.google.com/icons

### Angular Best Practices
- RxJS forkJoin: https://rxjs.dev/api/index/function/forkJoin
- Standalone Components: https://angular.io/guide/standalone-components
