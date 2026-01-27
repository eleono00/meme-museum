import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth'; // <--- Import modificato
import { Router, RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  // I file qui sotto devono corrispondere ai nomi corti che hai
  templateUrl: './register.html', 
  styleUrl: './register.scss'
})
export class RegisterComponent {
  user = {
    username: '',
    email: '',
    password: ''
  };

  constructor(
    private authService: AuthService,
    private router: Router,
    private toastr: ToastrService
  ) {}

  onRegister() {
    this.authService.register(this.user).subscribe({
      next: (response) => {
        this.toastr.success('Registrazione avvenuta con successo!', 'Evviva!');
        this.router.navigate(['/login']);
      },
     error: (err) => {
        // 1. Stampiamo l'errore in console per sicurezza (premi F12 per vederlo)
        console.log("Errore completo:", err);

        // 2. Cerchiamo il messaggio specifico del server
        // Se esiste err.error.message (es. "Email già in uso"), usiamo quello.
        // Altrimenti usiamo un messaggio generico.
        const messaggio = err.error && err.error.message 
                          ? err.error.message 
                          : 'Errore di connessione al server';

        // 3. Mostriamo la notifica rossa con il testo giusto
        this.toastr.error(messaggio, 'Errore Registrazione');}
    });
  }
}