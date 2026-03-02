import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login';
import { Layout } from './components/layout/layout';
import { DashboardComponent } from './components/dashboard/dashboard';
import { EmployeesComponent } from './components/employees/employees';
import { OrdersComponent } from './components/orders/orders.component'; // <-- 1. IMPORTAR AQUÍ
import { adminAuthGuard } from './guards/admin-auth-guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { 
    path: '', 
    component: Layout,
    canActivate: [adminAuthGuard],
    children: [
      { path: 'dashboard', component: DashboardComponent },
      { path: 'employees', component: EmployeesComponent },
      { path: 'orders', component: OrdersComponent }, // <-- 2. AGREGAR LA RUTA AQUÍ
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },
  { path: '**', redirectTo: 'login' }
];