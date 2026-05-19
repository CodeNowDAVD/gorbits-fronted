import { Component, inject, OnInit, signal } from '@angular/core';
import { CommercialProviderApiService } from '../services/commercial-provider-api.service';
import type { ProviderProfileResponse } from '../services/provider-commercial.types';

@Component({
  selector: 'app-provider-profile-page',
  standalone: true,
  imports: [],
  templateUrl: './provider-profile-page.component.html',
  styleUrl: './provider-profile-page.component.scss',
})
export class ProviderProfilePageComponent implements OnInit {
  private readonly commercial = inject(CommercialProviderApiService);

  readonly profile = signal<ProviderProfileResponse | null>(null);
  readonly loading = signal(true);
  readonly loadError = signal<string | null>(null);

  ngOnInit(): void {
    this.commercial.getProviderProfile().subscribe({
      next: (p) => {
        this.profile.set(p);
        this.loading.set(false);
      },
      error: () => {
        this.loadError.set('No se pudo cargar tu perfil.');
        this.loading.set(false);
      },
    });
  }

  displayName(p: ProviderProfileResponse): string {
    const parts = [p.firstName, p.lastName].filter((x) => x?.trim());
    return parts.length ? parts.join(' ') : p.username;
  }

  field(value: string | null | undefined): string {
    return value?.trim() ? value.trim() : '—';
  }
}
