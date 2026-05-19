import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ProviderModoNavComponent } from '../components/provider-modo-nav.component';
import { CommercialProviderApiService } from '../services/commercial-provider-api.service';
import type { ClientResponse } from '../services/provider-commercial.types';

@Component({
  selector: 'app-provider-clients-page',
  standalone: true,
  imports: [RouterLink, ProviderModoNavComponent],
  templateUrl: './provider-clients-page.component.html',
})
export class ProviderClientsPageComponent implements OnInit, OnDestroy {
  private readonly commercial = inject(CommercialProviderApiService);
  private searchDebounce: ReturnType<typeof setTimeout> | undefined;

  readonly clients = signal<ClientResponse[]>([]);
  readonly searchQuery = signal('');
  readonly loading = signal(true);
  readonly searching = signal(false);
  readonly error = signal<string | null>(null);

  ngOnInit(): void {
    this.reload();
  }

  ngOnDestroy(): void {
    clearTimeout(this.searchDebounce);
  }

  onSearchInput(value: string): void {
    this.searchQuery.set(value);
    clearTimeout(this.searchDebounce);
    this.searchDebounce = setTimeout(() => this.reload(), 300);
  }

  reload(): void {
    const initial = this.loading();
    if (!initial) {
      this.searching.set(true);
    }
    this.error.set(null);
    this.commercial.listClients(this.searchQuery()).subscribe({
      next: (c) => {
        this.clients.set(c);
        this.loading.set(false);
        this.searching.set(false);
      },
      error: () => {
        this.error.set('No se pudieron cargar los clientes.');
        this.loading.set(false);
        this.searching.set(false);
      },
    });
  }

  deleteClient(id: number, name: string): void {
    if (!confirm(`¿Eliminar al cliente «${name}»?`)) return;
    this.commercial.deleteClient(id).subscribe({
      next: () => this.reload(),
      error: () => alert('No se pudo eliminar (¿tiene guías asociadas?).'),
    });
  }
}
