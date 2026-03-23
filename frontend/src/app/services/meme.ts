import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MemeService {
  private apiUrl = 'http://localhost:3001/api/memes';

  constructor(private http: HttpClient) { }

  getMemes(page: number = 1, tag: string = '', sort: string = 'newest', userId: number | null = null): Observable<any> {
    let url = `${this.apiUrl}?page=${page}&sort=${sort}`;
    
    if (tag) url += `&tag=${tag}`;
    if (userId) url += `&user=${userId}`; 
    
    return this.http.get(url);
  }

  getMemeOfTheDay(): Observable<any> {
    return this.http.get(`${this.apiUrl}/day`);
  }

  createMeme(formData: FormData): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.post(this.apiUrl, formData, { headers });
  }

  deleteMeme(id: number): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.delete(`${this.apiUrl}/${id}`, { headers });
  }

  toggleLike(id: number): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.post(`${this.apiUrl}/${id}/like`, {}, { headers });
  }

  // 👇 NUOVA FUNZIONE AGGIUNTA PER IL DISLIKE!
  toggleDislike(id: number): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.post(`${this.apiUrl}/${id}/dislike`, {}, { headers });
  }

  addComment(id: number, text: string): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.post(`${this.apiUrl}/${id}/comments`, { text }, { headers });
  }

  uploadMeme(title: string, image: File, tags: string): Observable<any> {
    const formData = new FormData();
    formData.append('title', title);
    formData.append('image', image);
    if (tags) {
      formData.append('tags', tags);
    }
    
    const token = localStorage.getItem('token'); 
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.post(this.apiUrl, formData, { headers: headers });
  }
}