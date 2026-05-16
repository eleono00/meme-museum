import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Meme } from '../models/meme'; 

@Injectable({
  providedIn: 'root'
})
export class MemeService {
  private apiUrl = 'http://localhost:3001/api/memes';

  constructor(private http: HttpClient) { }

  getMemes(page: number = 1, tag: string = '', sort: string = 'newest', userId: number | null = null): Observable<Meme[]> {
    let url = `${this.apiUrl}?page=${page}&sort=${sort}`;
    if (tag) url += `&tag=${tag}`;
    if (userId) url += `&user=${userId}`; 
    return this.http.get<Meme[]>(url);
  }

  getMemeOfTheDay(): Observable<Meme> {
    return this.http.get<Meme>(`${this.apiUrl}/day`);
  }

  createMeme(formData: FormData): Observable<any> {
    return this.http.post(this.apiUrl, formData);
  }

  deleteMeme(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  toggleLike(id: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/${id}/like`, {});
  }

  toggleDislike(id: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/${id}/dislike`, {});
  }

  addComment(id: number, text: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/${id}/comments`, { text });
  }

  uploadMeme(title: string, image: File, tags: string): Observable<any> {
    const formData = new FormData();
    formData.append('title', title);
    formData.append('image', image);
    if (tags) {
      formData.append('tags', tags);
    }
    return this.http.post(this.apiUrl, formData);
  }
}