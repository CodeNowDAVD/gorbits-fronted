import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter, map, startWith } from 'rxjs';
import { homeUrlForRole } from '../core/role-redirect';
import { AuthService } from '../core/services/auth.service';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './shell.component.html',
  styleUrl: './shell.component.scss',
})
export class ShellComponent {
  readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  /** En proveedor usamos solo el shell FOCUS (sin barra superior duplicada). */
  homeLink(): string {
    return homeUrlForRole(this.auth.session()?.role);
  }

  /** En proveedor usamos solo el shell FOCUS (sin barra superior duplicada). */
  readonly proveedorLayout = toSignal(
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      map(() => this.router.url.startsWith('/proveedor')),
      startWith(this.router.url.startsWith('/proveedor')),
    ),
    { initialValue: this.router.url.startsWith('/proveedor') },
  );

  readonly adminLayout = toSignal(
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      map(() => this.router.url.startsWith('/admin')),
      startWith(this.router.url.startsWith('/admin')),
    ),
    { initialValue: this.router.url.startsWith('/admin') },
  );
}
