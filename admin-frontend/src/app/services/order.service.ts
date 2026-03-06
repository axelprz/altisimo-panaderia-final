import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private apiUrl = 'http://localhost:8080/api';

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  // Obtiene los pedidos recién creados
  getPendingOrders(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/admin/orders/pending`, { headers: this.getAuthHeaders() });
  }

  // NUEVO: Obtiene los pedidos que ya fueron aceptados y están listos para entregar
  getAcceptedOrders(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/admin/orders/accepted`, { headers: this.getAuthHeaders() });
  }

  // Actualiza el estado (sirve para accepted, rejected, delivered, cancelled)
  updateOrderStatus(id: number, status: string, reason?: string, deliveryDate?: string): Observable<any> {
    // AQUÍ ESTÁ LA CLAVE: Enviamos "delivery_date" (Snake Case) para que coincida con Go
    const body = { 
      status: status, 
      reason: reason, 
      delivery_date: deliveryDate // <-- CORRECCIÓN AQUÍ
    };
    return this.http.put(`${this.apiUrl}/admin/orders/${id}/status`, body, { headers: this.getAuthHeaders() });
  }
}