import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { HomeComponent } from './pages/home/home.component';
import { MainLayoutComponent } from './components/layout/main-layout.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  // RUTA 1: Login (Sin Navbar, Sin Guard)
  { 
    path: 'login', 
    component: LoginComponent 
  },

  // RUTA 2: App Principal (Con Navbar, Protegida)
  {
    path: '',
    component: MainLayoutComponent, // Este componente tiene el <app-navbar>
    canActivate: [authGuard],       // Protegemos toda esta sección
    children: [
      { path: '', component: HomeComponent }, // Al entrar a '/', carga Home dentro del Layout
      // Aquí agregaremos más en el futuro:
      // { path: 'productos', component: ProductsComponent },
    ]
  },

  // Redirección por defecto
  { path: '**', redirectTo: '' }
];