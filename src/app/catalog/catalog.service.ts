import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import type { BookResponse, CategoryResponse } from './catalog.models';

@Injectable({ providedIn: 'root' })
export class CatalogService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiBaseUrl}/catalog`;

  listCategories(): Observable<CategoryResponse[]> {
    return this.http.get<CategoryResponse[]>(`${this.base}/categories`);
  }

  listBooks(categoryId?: number | null): Observable<BookResponse[]> {
    let params = new HttpParams();
    if (categoryId != null && categoryId !== undefined) {
      params = params.set('categoryId', String(categoryId));
    }
    return this.http.get<BookResponse[]>(`${this.base}/books`, { params });
  }

  getBook(id: number): Observable<BookResponse> {
    return this.http.get<BookResponse>(`${this.base}/books/${id}`);
  }
}
