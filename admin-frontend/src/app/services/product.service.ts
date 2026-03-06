import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Product {
  ID?: number;
  name: string;
  price: number;
  unidad: string;
  desc: string;
  img?: string;
  is_active?: boolean;
  variedades?: string[];
}

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private apiUrl = 'http://localhost:8080/api'; 

  constructor(private http: HttpClient) {}

  // Generador de cabeceras con el Token
  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token'); // Asegúrate de que así guardas tu token en el login
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  // Público: No necesita token
  getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}/product`);
  }

  // Admin: REQUIEREN TOKEN
  createProduct(data: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}/admin/products`, data, { headers: this.getAuthHeaders() });
  }

  updateProduct(id: number, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/admin/products/${id}`, data, { headers: this.getAuthHeaders() });
  }

  deleteProduct(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/admin/products/${id}`, { headers: this.getAuthHeaders() });
  }
}