import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './services/auth.service';

/** Ruta de inicio según rol del usuario autenticado. */
export function homeUrlForRole(role: string | undefined): string {
  if (role === 'PROVEEDOR') {
    return '/proveedor';
  }
  if (role === 'ADMIN') {
    return '/admin/dashboard';
  }
  return '/home';
}

/** Ruta legacy /catalog: ya no hay página global; redirige según rol. */
export const legacyCatalogRedirectGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const role = auth.session()?.role;
  if (role === 'PROVEEDOR') {
    return router.createUrlTree(['/proveedor', 'catalogo']);
  }
  if (role === 'ADMIN') {
    return router.createUrlTree(['/admin', 'libros']);
  }
  return router.createUrlTree(['/home']);
};

/** Redirige la raíz o /home al workspace correcto (proveedor → FOCUS). */
export const roleDefaultRedirectGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return router.createUrlTree([homeUrlForRole(auth.session()?.role)]);
};
