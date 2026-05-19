import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import type { BookRequest, BookResponse, CategoryRequest, CategoryResponse } from '../../catalog/catalog.models';

@Injectable({ providedIn: 'root' })
export class CatalogAdminApiService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiBaseUrl}/catalog`;

  createCategory(body: CategoryRequest): Observable<CategoryResponse> {
    return this.http.post<CategoryResponse>(`${this.base}/categories`, body);
  }

  updateCategory(id: number, body: CategoryRequest): Observable<CategoryResponse> {
    return this.http.put<CategoryResponse>(`${this.base}/categories/${id}`, body);
  }

  deleteCategory(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/categories/${id}`);
  }

  createBook(body: BookRequest): Observable<BookResponse> {
    return this.http.post<BookResponse>(`${this.base}/books`, body);
  }

  updateBook(id: number, body: BookRequest): Observable<BookResponse> {
    return this.http.put<BookResponse>(`${this.base}/books/${id}`, body);
  }

  deleteBook(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/books/${id}`);
  }
}
