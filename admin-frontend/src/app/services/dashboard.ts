import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface DailySale {
  date: string;
  total: number;
}

export interface DashboardStats {
  total_sales: number;
  accepted_orders: number;
  pending_orders: number;
  delivered_orders: number; // NUEVO
  daily_sales: DailySale[]; // NUEVO
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private apiUrl = 'http://localhost:8080/api/admin/dashboard/stats';

  constructor(private http: HttpClient) {}

  private getHeaders() {
    const token = localStorage.getItem('token'); 
    return token ? new HttpHeaders().set('Authorization', `Bearer ${token}`) : new HttpHeaders();
  }

  getStats(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(this.apiUrl, { headers: this.getHeaders() });
  }
}