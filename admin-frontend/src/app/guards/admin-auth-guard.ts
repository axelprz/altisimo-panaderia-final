import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const adminAuthGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const token = localStorage.getItem('token');

  if (token) {
    return true; // Si hay token, lo dejamos pasar
  } else {
    router.navigate(['/login']); // Si no hay token, lo pateamos al login
    return false;
  }
};