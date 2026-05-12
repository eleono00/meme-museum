import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router'; // Importiamo il Router
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.html' // Controlla che il nome sia giusto
})
export class LoginComponent {
  email = '';
  password = '';
  errorMessage = '';

  // Iniettiamo il Router nel costruttore
  constructor(private authService: AuthService, private router: Router) {}
// controlliamo che ci siano tutti i campi compilati
  onLogin() {
    console.log("Tentativo di login...");
    // controlliamo che ci siano tutti i campi compilati
    if (!this.email || !this.password) {
      console.warn("[UI Login] Campi mancanti");
      this.errorMessage = "Compila tutti i campi!";
      return;
    }

    const credentials = { email: this.email, password: this.password };

    this.authService.login(credentials).subscribe({
      next: (response) => {
        console.log("Login riuscito! Risposta:", response);
         this.router.navigate(['/']); 
      },
      error: (err) => {
        console.error("Errore login:", err);
        this.errorMessage = "Email o Password errati.";
      }
    });
  }
}