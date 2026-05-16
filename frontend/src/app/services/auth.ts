import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';

//il nostro servizio e un singleton
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // Porta 3001 (quella del backend attivo)
//  Definisce l'indirizzo del server backend. È private perché nessun altro file deve poterla cambiare.
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

  //faccio in modo che mi restituisca lo user loggato
  getCurrentUser(): any {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }
}