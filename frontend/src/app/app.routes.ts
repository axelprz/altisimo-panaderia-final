import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { HomeComponent } from './pages/home/home.component';
import { AboutComponent } from './pages/about/about.component';
import { ProductComponent } from './pages/product/product.component';
import { ProductDetailComponent } from './pages/product-detail/product-detail.component'; // <--- Nueva importación
import { MainLayoutComponent } from './components/layout/main-layout.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },

  {
    path: '',
    component: MainLayoutComponent,
    
    children: [
      { path: '', component: HomeComponent },
      { path: 'nosotros', component: AboutComponent },
      { path: 'productos', component: ProductComponent },
      { path: 'producto/:id', component: ProductDetailComponent } // <--- Nueva ruta dinámica
    ]
  },

  {
    path: 'admin',
    component: MainLayoutComponent,
    canActivate: [authGuard], 
    children: []
  },

  { path: '**', redirectTo: '' }
];