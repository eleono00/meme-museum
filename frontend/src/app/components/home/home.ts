import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MemeService } from '../../services/meme';
import { ToastrService } from 'ngx-toastr';
import { Router, RouterModule } from '@angular/router';
import { Observable } from 'rxjs'; // <--- Importante per gestire il tipo Observable

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class HomeComponent implements OnInit {
  title: string = '';
  tags: string = '';
  selectedFile: File | null = null;
  isLoggedIn: boolean = false;

  // 1. Dichiariamo la variabile, ma NON la assegniamo ancora (usiamo ! per dire "fidati, la riempio dopo")
  memes$!: Observable<any[]>; 

  constructor(
    private memeService: MemeService,
    private toastr: ToastrService,
    private router: Router
  ) {}

  ngOnInit() {
    this.checkLoginStatus();

    // 2. ORA possiamo assegnarla, perché il memeService è pronto!
    this.memes$ = this.memeService.memes$;
    
    // 3. Facciamo partire il primo scaricamento dati
    this.memeService.refreshMemes();
  }

  checkLoginStatus() {
    const token = localStorage.getItem('token');
    this.isLoggedIn = !!token;
  }

  logout() {
    localStorage.removeItem('token');
    this.isLoggedIn = false;
    this.toastr.info('Logout effettuato');
    this.memeService.refreshMemes();
  }

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
  }

  upload() {
    if (!this.title || !this.selectedFile) {
      this.toastr.error('Dati mancanti', 'Errore');
      return;
    }

    this.memeService.createMeme(this.title, this.tags, this.selectedFile).subscribe({
      next: () => {
        this.toastr.success('Meme caricato!', 'Evviva');
        this.title = '';
        this.tags = '';
        this.selectedFile = null;
        // Non serve refresh manuale, ci pensa il service!
      },
      error: () => this.toastr.error('Errore caricamento', 'Ops')
    });
  }

  deleteMeme(id: number) {
    if(confirm("Sei sicuro di voler eliminare questa opera?")) {
      this.memeService.deleteMeme(id).subscribe({
        next: () => {
          this.toastr.success('Eliminato!');
        },
        error: () => this.toastr.error('Errore eliminazione', 'Errore')
      });
    }
  }

  postComment(memeId: number, inputElement: HTMLInputElement) {
    const text = inputElement.value;
    if (!text) return;

    this.memeService.addComment(memeId, text).subscribe({
      next: () => {
        this.toastr.success('Commento aggiunto!');
        inputElement.value = ''; 
      },
      error: () => this.toastr.error('Errore invio commento')
    });
  }
}