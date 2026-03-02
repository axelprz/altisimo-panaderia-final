import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'http://localhost:8080/api';

  // 1. La "Estación de Radio" que le avisa al Navbar si estamos logueados o no.
  // Inicia revisando si ya hay un token guardado de una sesión anterior.
  private loggedIn = new BehaviorSubject<boolean>(this.hasToken());
  
  // Esta es la variable que tu Navbar está "escuchando" (isLoggedIn$)
  isLoggedIn$ = this.loggedIn.asObservable();

  constructor(private http: HttpClient) {}

  // Verifica si la llave (token) existe en el navegador
  private hasToken(): boolean {
    return !!localStorage.getItem('token');
  }

  // 2. LOGIN DE CLIENTES NORMALES
  login(credentials: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, credentials).pipe(
      tap((response: any) => {
        // Guardamos el token que nos devuelve Go
        // IMPORTANTE: Asegúrate de que Go devuelva 'token' o 'Token' según tu struct
        const token = response.token || response.Token; 
        if (token) {
          localStorage.setItem('token', token);
          this.loggedIn.next(true); // ¡Avisamos que ya entramos!
        }
      })
    );
  }

  // 3. LOGIN DE ADMINISTRADORES (Panel de Control)
  adminLogin(credentials: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/admin/login`, credentials).pipe(
      tap((response: any) => {
        const token = response.token || response.Token;
        if (token) {
          localStorage.setItem('token', token);
          this.loggedIn.next(true); // ¡Avisamos que ya entramos!
        }
      })
    );
  }

  // 4. CERRAR SESIÓN
  logout(): void {
    localStorage.removeItem('token'); // Destruimos la llave
    this.loggedIn.next(false);        // Avisamos que salimos
  }
}