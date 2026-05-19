import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, map, Observable, of, switchMap, tap, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import type { LoginResponse, MeResponse } from '../models/auth.models';
import { TokenStorageService } from './token-storage.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly tokens = inject(TokenStorageService);
  private readonly router = inject(Router);

  readonly session = signal<MeResponse | null>(null);
  readonly isAuthenticated = computed(() => this.session() !== null);

  restoreSession(): Observable<void> {
    const token = this.tokens.getAccessToken();
    if (!token) {
      return of(undefined);
    }
    return this.fetchMe().pipe(
      catchError(() => {
        this.clearLocalSession();
        return of(undefined);
      }),
    );
  }

  login(username: string, password: string): Observable<void> {
    return this.http
      .post<LoginResponse>(`${environment.apiBaseUrl}/auth/login`, { username, password })
      .pipe(
        tap((res) => this.tokens.setAccessToken(res.accessToken)),
        switchMap(() =>
          this.fetchMe().pipe(
            catchError((err: unknown) => {
              this.clearLocalSession();
              return throwError(() => err);
            }),
          ),
        ),
      );
  }

  logout(): void {
    this.clearLocalSession();
    void this.router.navigate(['/login']);
  }

  private fetchMe(): Observable<void> {
    return this.http.get<MeResponse>(`${environment.apiBaseUrl}/me`).pipe(
      tap((me) => this.session.set(me)),
      map(() => undefined),
    );
  }

  private clearLocalSession(): void {
    this.tokens.clear();
    this.session.set(null);
  }
}
