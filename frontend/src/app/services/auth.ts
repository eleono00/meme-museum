import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // Porta 3001 (quella del backend attivo)
  private apiUrl = 'http://localhost:3001/api/auth';

  constructor(private http: HttpClient, private router: Router) { }

  // REGISTRAZIONE
  register(user: any) {
    return this.http.post(`${this.apiUrl}/register`, user);
  }

  // LOGIN
  login(credentials: any) {
    return this.http.post(`${this.apiUrl}/login`, credentials).pipe(
      tap((response: any) => {
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
      })
    );
  }

  // LOGOUT
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.router.navigate(['/login']);
  }

  // CONTROLLO SE SEI LOGGATO
  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  // 👇 QUESTA È LA FUNZIONE CHE MANCAVA E TI DAVA ERRORE 👇
  getCurrentUser(): any {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }
}