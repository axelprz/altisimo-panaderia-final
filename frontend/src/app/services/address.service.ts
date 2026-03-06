import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Address {
  ID?: number;
  title: string;
  street: string;
  city: string;
  phone: string;
  reference: string;
  is_default?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AddressService {
  private apiUrl = 'http://localhost:8080/api/user/addresses';

  constructor(private http: HttpClient) {}

  private getHeaders() {
    // IMPORTANTE: Usa el mismo nombre de token que usas en auth.service.ts ('token' o 'auth_token')
    const token = localStorage.getItem('auth_token'); 
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  getAddresses(): Observable<Address[]> {
    return this.http.get<Address[]>(this.apiUrl, { headers: this.getHeaders() });
  }

  addAddress(address: Address): Observable<Address> {
    return this.http.post<Address>(this.apiUrl, address, { headers: this.getHeaders() });
  }

  deleteAddress(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }
}