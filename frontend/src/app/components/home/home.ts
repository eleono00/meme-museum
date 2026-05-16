import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MemeService } from '../../services/meme'; 
import { AuthService } from '../../services/auth';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './home.html'
})
export class HomeComponent implements OnInit {
  memes: any[] = [];
  memeOfTheDay: any = null;
  selectedMeme: any = null; 
  
  isLoadingMemeOfDay: boolean = true;
  memeOfDayError: boolean = false;

  // Parametri per la paginazione e i filtri richiesti dalla traccia
  currentPage: number = 1;
  totalPages: number = 1;
  currentTag: string = '';
  currentSort: string = 'newest';
  
  // Informazioni di sessione dell'utente
  isLoggedIn: boolean = false;
  currentUserId: number | null = null;
  
  isUploadVisible: boolean = false;
  newMemeTitle: string = '';
  selectedFile: File | null = null;
  currentTagInput: string = '';
  tagsArray: string[] = [];
  
  isUploading: boolean = false;

  // Stream reattivo RxJS usato per controllare la barra di ricerca senza intasare il server
  searchSubject: Subject<string> = new Subject<string>();

  constructor(
    private memeService: MemeService, 
    public authService: AuthService,
    private cd: ChangeDetectorRef,
    private toastr: ToastrService
  ) {}

  ngOnInit() {
    // Controllo lo stato della sessione all'avvio della pagina
    this.isLoggedIn = this.authService.isLoggedIn();
    const user = this.authService.getCurrentUser();
    if (user) this.currentUserId = user.id;

    this.loadMemes();
    this.loadMemeOfTheDay();

    // Configuro la barra di ricerca reattiva
    this.searchSubject.pipe(
      debounceTime(400),
      distinctUntilChanged()
    ).subscribe(searchText => {
      this.currentTag = searchText.trim().replace(/^#+/, '');
      this.currentPage = 1; 
      this.loadMemes();
    });
  }

  loadMemes() {
    this.memeService.getMemes(this.currentPage, this.currentTag, this.currentSort).subscribe({
      next: (response: any) => {
        if (response.memes) {
          this.memes = response.memes;
          this.totalPages = response.totalPages;
        } else {
          this.memes = response; 
        }

        // Se una modale è aperta, ricollega il riferimento per mantenere l'UI sincronizzata
        if (this.selectedMeme) {
          const updated = this.memes.find(m => m.id === this.selectedMeme.id);
          if (updated) this.selectedMeme = updated;
        }
        this.cd.detectChanges(); 
      }
    });
  }

  loadMemeOfTheDay() {
    this.isLoadingMemeOfDay = true;
    this.memeOfDayError = false;
    this.memeService.getMemeOfTheDay().subscribe({
      next: (meme: any) => { this.memeOfTheDay = meme; this.isLoadingMemeOfDay = false; this.cd.detectChanges(); },
      error: (err) => { this.memeOfDayError = true; this.isLoadingMemeOfDay = false; this.cd.detectChanges(); }
    });
  }

  openMemeModal(meme: any) { this.selectedMeme = meme; }
  onSearchInput(text: string) { this.searchSubject.next(text); }
  searchByTag(tag: string) { this.currentTag = tag.replace(/^#+/, ''); this.currentPage = 1; this.loadMemes(); }
  onSortChange(event: any) { this.currentSort = event.target.value; this.currentPage = 1; this.loadMemes(); }

  toggleUpload() { this.isUploadVisible = !this.isUploadVisible; }
  onFileSelected(event: any) { this.selectedFile = event.target.files[0]; }
  
  onTagKeydown(event: KeyboardEvent) {
    if (event.key === ' ' || event.key === 'Enter') {
      event.preventDefault();
      // Premendo spazio o invio inserisce il tag nell'array dei chip grafici
      const tag = this.currentTagInput.trim().replace(/^#+/, '');
      if (tag && !this.tagsArray.includes(tag)) this.tagsArray.push(tag);
      this.currentTagInput = '';
    }
  }
  
  removeTag(index: number) { this.tagsArray.splice(index, 1); }

  uploadMeme() {
    if (!this.newMemeTitle || !this.selectedFile) { this.toastr.error("Errore durante la pubblicazione.", "Ops!"); return; }
    
    this.isUploading = true; 
    const tagsString = this.tagsArray.join(',');
    
    this.memeService.uploadMeme(this.newMemeTitle, this.selectedFile, tagsString).subscribe({
      next: () => {
        this.isUploadVisible = false; 
        this.isUploading = false; 
        this.newMemeTitle = '';
        this.selectedFile = null;
        this.tagsArray = [];
        this.loadMemes();
      },
      error: (err) => { 
        this.isUploading = false; 
        this.toastr.error("Errore durante la pubblicazione.", "Ops!"); 
      }
    });
  }

  deleteMeme(id: number) {
    if(confirm('Vuoi eliminare questo meme?')) this.memeService.deleteMeme(id).subscribe(() => this.loadMemes());
  }


// Funzione di supporto per simulare l'aggiunta o rimozione immediata del Like
  private updateLocalLikeState(target: any) {
    if (!target) return;
    if (!target.Likes) target.Likes = [];
    if (!target.Dislikes) target.Dislikes = [];

    const hasLiked = target.Likes.some((l: any) => l.UserId === this.currentUserId);
    
    if (hasLiked) {
      target.Likes = target.Likes.filter((l: any) => l.UserId !== this.currentUserId);
    } else {
      target.Likes.push({ UserId: this.currentUserId });
      // Se c'era un dislike dell'utente corrente, lo rimuovo per logica toggle coerente con il backend
      target.Dislikes = target.Dislikes.filter((d: any) => d.UserId !== this.currentUserId);
    }
  }

  private updateLocalDislikeState(target: any) {
    if (!target) return;
    if (!target.Likes) target.Likes = [];
    if (!target.Dislikes) target.Dislikes = [];

    const hasDisliked = target.Dislikes.some((d: any) => d.UserId === this.currentUserId);
    
    if (hasDisliked) {
      target.Dislikes = target.Dislikes.filter((d: any) => d.UserId !== this.currentUserId);
    } else {
      target.Dislikes.push({ UserId: this.currentUserId });
      target.Likes = target.Likes.filter((l: any) => l.UserId !== this.currentUserId);
    }
  }

  toggleLike(id: number) {
    if (!this.isLoggedIn) { this.toastr.info("Devi accedere per mettere Like ai meme.", "Ops!"); return; }

    const memeInGrid = this.memes.find(m => m.id === id);
    
    // Aggiorno istantaneamente il meme nella griglia
    if (memeInGrid) {
      this.updateLocalLikeState(memeInGrid);
    }

    if (this.memeOfTheDay && this.memeOfTheDay.id === id && this.memeOfTheDay !== memeInGrid) {
      this.updateLocalLikeState(this.memeOfTheDay);
    }

    // Chiamata al backend
    this.memeService.toggleLike(id).subscribe({
      error: () => this.loadMemes() // In caso di errore server, ripristino i dati reali
    });
  }

  toggleDislike(id: number) {
    if (!this.isLoggedIn) { this.toastr.info("Devi accedere per mettere Dislike ai meme.", "Ops!"); return; }

    const memeInGrid = this.memes.find(m => m.id === id);
    
    if (memeInGrid) {
      this.updateLocalDislikeState(memeInGrid);
    }

    if (this.memeOfTheDay && this.memeOfTheDay.id === id && this.memeOfTheDay !== memeInGrid) {
      this.updateLocalDislikeState(this.memeOfTheDay);
    }

    this.memeService.toggleDislike(id).subscribe({
      error: () => this.loadMemes()
    });
  }

  // Metodi ponte per gestire i bottoni veloci sulla sezione speciale "Meme del Giorno"
  likeMemeOfTheDay() {
    if (this.memeOfTheDay) this.toggleLike(this.memeOfTheDay.id);
  }

  dislikeMemeOfTheDay() {
    if (this.memeOfTheDay) this.toggleDislike(this.memeOfTheDay.id);
  }

  addComment(id: number, text: string) {
    if (!this.isLoggedIn) { this.toastr.info("Devi accedere per commetare i meme.", "Ops!"); return; }
    if(text.trim()) this.memeService.addComment(id, text).subscribe(() => this.loadMemes());
  }

  // Gestione del cambio pagina della paginazione richiesta dalla traccia
  nextPage() { if (this.currentPage < this.totalPages) { this.currentPage++; this.loadMemes(); } }
  prevPage() { if (this.currentPage > 1) { this.currentPage--; this.loadMemes(); } }

  // Metodi booleani di controllo usati nell'HTML per accendere o spegnere la classe CSS dei bottoni 
  isLiked(meme: any): boolean {
    if (!meme || !meme.Likes || !this.currentUserId) return false;
    return meme.Likes.some((like: any) => like.UserId === this.currentUserId);
  }

  isDisliked(meme: any): boolean {
    if (!meme || !meme.Dislikes || !this.currentUserId) return false;
    return meme.Dislikes.some((dislike: any) => dislike.UserId === this.currentUserId);
  }

  trackByMemeId(index: number, meme: any): number {
    return meme.id;
  }
}