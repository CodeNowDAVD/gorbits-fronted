import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class WarehouseAdminApiService {
  private readonly http = inject(HttpClient);
  private readonly root = `${environment.apiBaseUrl}/inventory/warehouse`;

  setBookQuantity(bookId: number, quantity: number): Observable<void> {
    return this.http.put<void>(`${this.root}/books/${bookId}`, { quantity });
  }
}
