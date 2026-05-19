import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../core/services/auth.service';
import { ProviderAvatarComponent } from './components/provider-avatar.component';
import { CommercialProviderApiService } from './services/commercial-provider-api.service';
import type { ProviderProfileResponse } from './services/provider-commercial.types';

@Component({
  selector: 'app-provider-shell',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, ProviderAvatarComponent],
  templateUrl: './provider-shell.component.html',
  styleUrl: './provider-shell.component.scss',
})
export class ProviderShellComponent implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly commercial = inject(CommercialProviderApiService);

  readonly profile = signal<ProviderProfileResponse | null>(null);
  readonly zoneName = signal<string | null>(null);

  username(): string {
    return this.auth.session()?.username ?? 'Proveedor';
  }

  displayName(): string {
    const p = this.profile();
    if (p) {
      const parts = [p.firstName, p.lastName].filter((x) => x?.trim());
      if (parts.length) {
        return parts.join(' ');
      }
    }
    const u = this.username();
    return u.charAt(0).toUpperCase() + u.slice(1);
  }

  ngOnInit(): void {
    this.commercial.getProviderProfile().subscribe({
      next: (p) => {
        this.profile.set(p);
        this.zoneName.set(p.zoneName);
      },
      error: () => {
        this.profile.set(null);
        this.zoneName.set(null);
      },
    });
  }

  logout(): void {
    this.auth.logout();
  }
}
