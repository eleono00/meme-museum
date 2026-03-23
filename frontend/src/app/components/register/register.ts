import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './register.html'
})
export class RegisterComponent {
  username = '';
  email = '';
  password = '';
  errorMessage = '';

  constructor(private authService: AuthService, private router: Router) {}

  onRegister() {
    console.log(" [UI REGISTER] Click pulsante Registrati");
    
    if (!this.username || !this.email || !this.password) {
      console.warn("[UI REGISTER] Campi mancanti");
      this.errorMessage = "Compila tutti i campi!";
      return;
    }

    const user = { username: this.username, email: this.email, password: this.password };
    
    this.authService.register(user).subscribe({
      next: () => {
        alert("Registrazione OK!");
        console.log("🚀 [UI REGISTER] Reindirizzamento al Login...");
        this.router.navigate(['/login']);
      },
      error: (err) => {
        console.error(" [UI REGISTER] Errore ricevuto:", err);
        this.errorMessage = "Errore durante la registrazione. Vedi console.";
      }
    });
  }
}