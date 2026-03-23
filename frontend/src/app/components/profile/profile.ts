import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MemeService } from '../../services/meme'; 
import { AuthService } from '../../services/auth';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './profile.html'
})
export class ProfileComponent implements OnInit {
  myMemes: any[] = [];
  selectedMeme: any = null; 
  user: any = null;
  
  currentPage: number = 1;
  totalPages: number = 1;
  currentTag: string = '';
  currentSort: string = 'newest';
  
  currentUserId: number | null = null;
  searchSubject: Subject<string> = new Subject<string>();

  constructor(
    private memeService: MemeService, 
    public authService: AuthService,
    private cd: ChangeDetectorRef 
  ) {}

  ngOnInit() {
    this.user = this.authService.getCurrentUser();
    if (this.user) {
      this.currentUserId = this.user.id;
      this.loadMyMemes();
    }

    this.searchSubject.pipe(
      debounceTime(400),
      distinctUntilChanged()
    ).subscribe(searchText => {
      this.currentTag = searchText.trim().replace(/^#+/, '');
      this.currentPage = 1; 
      this.loadMyMemes();
    });
  }

  loadMyMemes() {
    if (!this.user) return;
    this.memeService.getMemes(this.currentPage, this.currentTag, this.currentSort, this.user.id).subscribe({
      next: (response: any) => {
        if (response.memes) {
          this.myMemes = response.memes;
          this.totalPages = response.totalPages;
        } else {
          this.myMemes = response; 
        }

        // Se una modale è aperta, ricollega il riferimento per mantenere l'UI sincronizzata
        if (this.selectedMeme) {
          const updated = this.myMemes.find(m => m.id === this.selectedMeme.id);
          if (updated) this.selectedMeme = updated;
        }
        this.cd.detectChanges(); 
      },
      error: (err) => console.error("Errore caricamento profilo:", err)
    });
  }

  openMemeModal(meme: any) { this.selectedMeme = meme; }
  onSearchInput(text: string) { this.searchSubject.next(text); }
  searchByTag(tag: string) { this.currentTag = tag.replace(/^#+/, ''); this.currentPage = 1; this.loadMyMemes(); }
  onSortChange(event: any) { this.currentSort = event.target.value; this.currentPage = 1; this.loadMyMemes(); }

  deleteMeme(id: number) {
    if(confirm('Vuoi eliminare questa opera dalla tua galleria?')) {
      this.memeService.deleteMeme(id).subscribe(() => this.loadMyMemes());
    }
  }

  // --- LOGICA OPTIMISTIC UI PULITA ---

  private updateLocalLikeState(target: any) {
    if (!target || !this.currentUserId) return;
    if (!target.Likes) target.Likes = [];
    if (!target.Dislikes) target.Dislikes = [];

    const hasLiked = target.Likes.some((l: any) => l.UserId === this.currentUserId);
    
    if (hasLiked) {
      target.Likes = target.Likes.filter((l: any) => l.UserId !== this.currentUserId);
    } else {
      target.Likes.push({ UserId: this.currentUserId });
      target.Dislikes = target.Dislikes.filter((d: any) => d.UserId !== this.currentUserId);
    }
  }

  private updateLocalDislikeState(target: any) {
    if (!target || !this.currentUserId) return;
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
    const memeInGrid = this.myMemes.find(m => m.id === id);
    
    // Aggiorniamo il meme nella griglia (essendo un riferimento, aggiorna anche selectedMeme)
    if (memeInGrid) {
      this.updateLocalLikeState(memeInGrid);
    }

    // Chiamata silenziosa al backend
    this.memeService.toggleLike(id).subscribe({
      error: () => this.loadMyMemes() // In caso di errore server, ripristina i dati reali
    });
  }

  toggleDislike(id: number) {
    const memeInGrid = this.myMemes.find(m => m.id === id);
    
    if (memeInGrid) {
      this.updateLocalDislikeState(memeInGrid);
    }

    this.memeService.toggleDislike(id).subscribe({
      error: () => this.loadMyMemes()
    });
  }

  addComment(id: number, text: string) {
    if(text.trim()) this.memeService.addComment(id, text).subscribe(() => this.loadMyMemes());
  }

  nextPage() { if (this.currentPage < this.totalPages) { this.currentPage++; this.loadMyMemes(); } }
  prevPage() { if (this.currentPage > 1) { this.currentPage--; this.loadMyMemes(); } }
}