
import { AuthService } from '../../services/auth'; // Il nostro postino
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router'; 
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss' // o .scss
})
export class LoginComponent {
  user = {
    email: '',
    password: ''
  };

  // 2. IMPORTANTE: Devi inserire 'private router: Router' qui dentro!
  constructor(
    private authService: AuthService, 
    private router: Router,             // <--- SENZA QUESTO, NON PUÒ NAVIGARE!
    private toastr: ToastrService
  ) {}

  onLogin() {
    // Validazione semplice
    if (!this.user.email || !this.user.password) {
      this.toastr.error('Compila tutti i campi', 'Errore');
      return;
    }

    this.authService.login(this.user).subscribe({
      next: (response) => {
        this.toastr.success('Bentornato!', 'Login effettuato');
        
        // Salva il token
        localStorage.setItem('token', response.token);
        
        console.log("Token salvato, provo a navigare verso Home...");

        // 3. ORA QUESTO FUNZIONERÀ
        this.router.navigate(['/home']); 
      },
      error: (error) => {
        console.error(error);
        this.toastr.error('Email o password errati', 'Errore Login');
      }
    });
  }
}
