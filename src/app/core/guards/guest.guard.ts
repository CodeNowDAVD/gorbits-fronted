import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { homeUrlForRole } from '../role-redirect';
import { AuthService } from '../services/auth.service';

export const guestGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (!auth.isAuthenticated()) {
    return true;
  }
  return router.createUrlTree([homeUrlForRole(auth.session()?.role)]);
};
