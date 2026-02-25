import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { HomeComponent } from './pages/home/home.component';
import { AboutComponent } from './pages/about/about.component';
import { ProductComponent } from './pages/product/product.component';
import { ProductDetailComponent } from './pages/product-detail/product-detail.component';
import { ProfileComponent } from './pages/profile/profile.component'; // <--- Nueva importación para el Perfil
import { MainLayoutComponent } from './components/layout/main-layout.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  // Ruta de Login (Pública, sin layout)
  { path: 'login', component: LoginComponent },

  // Rutas PÚBLICAS (Con Navbar, sin protección)
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      { path: '', component: HomeComponent },
      { path: 'nosotros', component: AboutComponent },
      { path: 'productos', component: ProductComponent },
      { path: 'producto/:id', component: ProductDetailComponent }
    ]
  },

  // Rutas PRIVADAS (Con Navbar, Protegidas por authGuard)
  {
    path: 'admin',
    component: MainLayoutComponent,
    canActivate: [authGuard], 
    children: [
      // Al entrar a /admin/perfil, cargará el ProfileComponent
      { path: 'perfil', component: ProfileComponent } 
    ]
  },

  // Redirección para cualquier ruta que no exista
  { path: '**', redirectTo: '' }
];