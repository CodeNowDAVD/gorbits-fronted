import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import type {
  AdminCreateProviderRequest,
  AdminDashboardResponse,
  AdminUpdateProviderRequest,
  ProviderAccountResponse,
  UserAccountSummaryResponse,
} from './admin.types';

@Injectable({ providedIn: 'root' })
export class AdminApiService {
  private readonly http = inject(HttpClient);
  private readonly api = `${environment.apiBaseUrl}/admin`;

  getDashboard(): Observable<AdminDashboardResponse> {
    return this.http.get<AdminDashboardResponse>(`${this.api}/dashboard`);
  }

  listProviders(): Observable<ProviderAccountResponse[]> {
    return this.http.get<ProviderAccountResponse[]>(`${this.api}/providers`);
  }

  listUsers(): Observable<UserAccountSummaryResponse[]> {
    return this.http.get<UserAccountSummaryResponse[]>(`${this.api}/users`);
  }

  resetPassword(userId: number, newPassword: string): Observable<UserAccountSummaryResponse> {
    return this.http.put<UserAccountSummaryResponse>(`${this.api}/users/${userId}/password`, {
      newPassword,
    });
  }

  setEnabled(userId: number, enabled: boolean): Observable<UserAccountSummaryResponse> {
    return this.http.patch<UserAccountSummaryResponse>(`${this.api}/users/${userId}/enabled`, {
      enabled,
    });
  }

  setRole(userId: number, role: 'ADMIN' | 'PROVEEDOR'): Observable<UserAccountSummaryResponse> {
    return this.http.patch<UserAccountSummaryResponse>(`${this.api}/users/${userId}/role`, { role });
  }

  createProvider(body: AdminCreateProviderRequest): Observable<UserAccountSummaryResponse> {
    return this.http.post<UserAccountSummaryResponse>(`${this.api}/users/providers`, body);
  }

  updateProvider(userId: number, body: AdminUpdateProviderRequest): Observable<ProviderAccountResponse> {
    return this.http.put<ProviderAccountResponse>(`${this.api}/providers/${userId}`, body);
  }
}
