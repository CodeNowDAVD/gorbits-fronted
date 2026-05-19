import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet, type IsActiveMatchOptions } from '@angular/router';
import { AuthService } from '../core/services/auth.service';
import { ADMIN_NAV_GROUPS, type AdminNavItem } from './admin-nav.config';

@Component({
  selector: 'app-admin-shell',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './admin-shell.component.html',
  styleUrl: './admin-shell.component.scss',
})
export class AdminShellComponent {
  private readonly auth = inject(AuthService);

  readonly navGroups = ADMIN_NAV_GROUPS;

  logout(): void {
    this.auth.logout();
  }

  linkMatch(item: AdminNavItem): IsActiveMatchOptions {
    if (item.exact) {
      return { paths: 'exact', queryParams: 'exact', fragment: 'ignored', matrixParams: 'ignored' };
    }
    return { paths: 'subset', queryParams: 'ignored', fragment: 'ignored', matrixParams: 'ignored' };
  }
}
