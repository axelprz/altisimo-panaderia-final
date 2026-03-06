import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Product {
  ID: number;
  name: string;
  price: number;
  unidad: string;
  desc: string;
  img?: string;          // Opcional por si no hay imagen
  variedades?: string[]; // Opcional para variedades
  is_active?: boolean;   // <-- ¡NUEVO! Crucial para filtrar los pausados
}

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private apiUrl = 'http://localhost:8080/api/product';

  constructor(private http: HttpClient) {}

  getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(this.apiUrl);
  }
}