import { Routes } from '@angular/router';
import { authGuard } from '@core';
import { AdminLayout } from '@theme/admin-layout/admin-layout';
import { AuthLayout } from '@theme/auth-layout/auth-layout';
import { Dashboard } from './routes/dashboard/dashboard';
import { Error403 } from './routes/sessions/error-403';
import { Error404 } from './routes/sessions/error-404';
import { Error500 } from './routes/sessions/error-500';
import { Login } from './routes/sessions/login/login';
import { Register } from './routes/sessions/register/register';
import { CallbackComponent } from './routes/sessions/callback/callback';
import { hrAdminGuard, managerGuard } from './core/authentication/role.guard';
import { EmployeeListComponent } from './routes/employees/employee-list.component';
import { EmployeeDetailComponent } from './routes/employees/employee-detail.component';
import { EmployeeFormComponent } from './routes/employees/employee-form.component';
import { DepartmentListComponent } from './routes/departments/department-list.component';
import { DepartmentDetailComponent } from './routes/departments/department-detail.component';
import { DepartmentFormComponent } from './routes/departments/department-form.component';
import { PositionListComponent } from './routes/positions/position-list.component';
import { PositionDetailComponent } from './routes/positions/position-detail.component';
import { PositionFormComponent } from './routes/positions/position-form.component';
import { SalaryRangeListComponent } from './routes/salary-ranges/salary-range-list.component';
import { SalaryRangeDetailComponent } from './routes/salary-ranges/salary-range-detail.component';
import { SalaryRangeFormComponent } from './routes/salary-ranges/salary-range-form.component';
import { ProfileOverviewComponent } from './routes/profile/profile-overview.component';
import { ProfileSettingsComponent } from './routes/profile/profile-settings.component';

export const routes: Routes = [
  {
    path: '',
    component: AdminLayout,
    canActivate: [authGuard],
    canActivateChild: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: Dashboard },
      { path: 'employees', component: EmployeeListComponent },
      { path: 'employees/create', component: EmployeeFormComponent, canActivate: [managerGuard] },
      { path: 'employees/edit/:id', component: EmployeeFormComponent, canActivate: [managerGuard] },
      { path: 'employees/:id', component: EmployeeDetailComponent },
      { path: 'departments', component: DepartmentListComponent },
      { path: 'departments/create', component: DepartmentFormComponent, canActivate: [managerGuard] },
      { path: 'departments/edit/:id', component: DepartmentFormComponent, canActivate: [managerGuard] },
      { path: 'departments/:id', component: DepartmentDetailComponent },
      { path: 'positions', component: PositionListComponent },
      { path: 'positions/create', component: PositionFormComponent, canActivate: [hrAdminGuard] },
      { path: 'positions/edit/:id', component: PositionFormComponent, canActivate: [hrAdminGuard] },
      { path: 'positions/:id', component: PositionDetailComponent },
      { path: 'salary-ranges', component: SalaryRangeListComponent },
      { path: 'salary-ranges/create', component: SalaryRangeFormComponent, canActivate: [hrAdminGuard] },
      { path: 'salary-ranges/edit/:id', component: SalaryRangeFormComponent, canActivate: [hrAdminGuard] },
      { path: 'salary-ranges/:id', component: SalaryRangeDetailComponent },
      {
        path: 'profile',
        children: [
          { path: 'overview', component: ProfileOverviewComponent },
          { path: 'settings', component: ProfileSettingsComponent },
          { path: '', redirectTo: 'overview', pathMatch: 'full' },
        ],
      },
      { path: '403', component: Error403 },
      { path: '404', component: Error404 },
      { path: '500', component: Error500 },
    ],
  },
  {
    path: 'auth',
    component: AuthLayout,
    children: [
      { path: 'login', component: Login },
      { path: 'register', component: Register },
    ],
  },
  { path: 'login', component: Login },
  { path: 'callback', component: CallbackComponent },
  { path: '**', redirectTo: 'dashboard' },
];
