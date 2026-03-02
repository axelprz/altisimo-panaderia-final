import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface DashboardStats {
  total_sales: number;
  accepted_orders: number;
  pending_orders: number;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private apiUrl = 'http://localhost:8080/api/admin/dashboard/stats';

  constructor(private http: HttpClient) {}

  // Creamos la función para obtener el token
  private getHeaders() {
    // IMPORTANTE: Revisa si en tu login de admin guardas el token como 'admin_token' o solo 'token'
    const token = localStorage.getItem('token'); 
    return token ? new HttpHeaders().set('Authorization', `Bearer ${token}`) : new HttpHeaders();
  }

  getStats(): Observable<DashboardStats> {
    // Le pasamos las cabeceras a la petición GET
    return this.http.get<DashboardStats>(this.apiUrl, { headers: this.getHeaders() });
  }
}