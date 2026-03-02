import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private apiUrl = 'http://localhost:8080/api/admin/orders';

  constructor(private http: HttpClient) {}

  private getHeaders() {
    const token = localStorage.getItem('token');
    return token ? new HttpHeaders().set('Authorization', `Bearer ${token}`) : new HttpHeaders();
  }

  getPendingOrders(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/pending`, { headers: this.getHeaders() });
  }

  updateOrderStatus(id: number, status: string, rejectionReason: string = '', deliveryDate: string = '') {
  return this.http.put(`${this.apiUrl}/${id}/status`, { 
    status, 
    rejection_reason: rejectionReason,
    delivery_date: deliveryDate // <--- Esto envía la fecha a tu backend en Go
  }, { headers: this.getHeaders() });
}
}