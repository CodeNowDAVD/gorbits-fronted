import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { TokenStorageService } from '../services/token-storage.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const tokenStorage = inject(TokenStorageService);
  const isLogin =
    req.method === 'POST' &&
    (req.url.endsWith('/auth/login') || req.url.includes('/api/v1/auth/login'));

  if (isLogin) {
    return next(req);
  }

  const token = tokenStorage.getAccessToken();
  if (token) {
    req = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` },
    });
  }
  return next(req);
};
