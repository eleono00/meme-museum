import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, tap } from 'rxjs'; // Importiamo gli strumenti per l'Observable

@Injectable({
  providedIn: 'root'
})
export class MemeService {
  private apiUrl = 'http://localhost:3000/api/memes';

  // 1. IL FLUSSO DATI (Inizia vuoto)
  private memesSubject = new BehaviorSubject<any[]>([]);
  
  // 2. L'ANTENNA PUBBLICA (La Home si collegherà qui)
  public memes$ = this.memesSubject.asObservable();

  constructor(private http: HttpClient) {}

  // --- SCARICA E AGGIORNA TUTTI ---
  refreshMemes() {
    this.http.get<any[]>(this.apiUrl).subscribe({
      next: (data) => {
        // Correzione per Windows: cambia \ in /
        const cleanData = data.map(meme => {
          if (meme.imagePath) {
            meme.imagePath = meme.imagePath.replace(/\\/g, '/');
          }
          return meme;
        });

        console.log('📡 Dati aggiornati nel Service:', cleanData.length);
        // Avvisa tutti i componenti che ascoltano
        this.memesSubject.next(cleanData);
      },
      error: (err) => console.error('Errore refresh:', err)
    });
  }

  // --- CREA MEME (e aggiorna subito) ---
  createMeme(title: string, tags: string, image: File) {
    const formData = new FormData();
    formData.append('title', title);
    formData.append('tags', tags);
    formData.append('image', image);

    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({ 'Authorization': `${token}` });

    return this.http.post(`${this.apiUrl}/create`, formData, { headers }).pipe(
      // Appena il server dice "OK", noi aggiorniamo la lista per tutti
      tap(() => this.refreshMemes())
    );
  }

  // --- ELIMINA MEME (e aggiorna subito) ---
  deleteMeme(id: number) {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({ 'Authorization': `${token}` });

    return this.http.delete(`${this.apiUrl}/${id}`, { headers }).pipe(
      tap(() => this.refreshMemes())
    );
  }

  // --- AGGIUNGI COMMENTO (e aggiorna subito) ---
  addComment(memeId: number, text: string) {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({ 'Authorization': `${token}` });
    return this.http.post(`${this.apiUrl}/${memeId}/comments`, { text }, { headers }).pipe(
        tap(() => this.refreshMemes())
    );
  }
}