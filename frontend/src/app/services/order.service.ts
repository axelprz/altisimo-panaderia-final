import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private apiUrl = 'http://localhost:8080/api';

  constructor(private http: HttpClient) {}

  private getHeaders() {
    const token = localStorage.getItem('auth_token');
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  // Para que el cliente vea SU historial
  getUserOrders(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/user/orders`, { headers: this.getHeaders() });
  }

  // Para que el admin vea TODOS los pendientes (opcional si lo usas aquí)
  getPendingOrders(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/admin/orders/pending`, { headers: this.getHeaders() });
  }
}