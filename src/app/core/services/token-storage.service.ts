import { Injectable } from '@angular/core';

const STORAGE_KEY = 'gorbits.accessToken';

@Injectable({ providedIn: 'root' })
export class TokenStorageService {
  getAccessToken(): string | null {
    return sessionStorage.getItem(STORAGE_KEY);
  }

  setAccessToken(token: string): void {
    sessionStorage.setItem(STORAGE_KEY, token);
  }

  clear(): void {
    sessionStorage.removeItem(STORAGE_KEY);
  }
}
