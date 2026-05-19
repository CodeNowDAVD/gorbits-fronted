import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ProviderModoNavComponent } from '../components/provider-modo-nav.component';
import { CommercialProviderApiService } from '../services/commercial-provider-api.service';
import type { GuideListItemResponse, SalesContractTagResponse } from '../services/provider-commercial.types';

@Component({
  selector: 'app-provider-guides-page',
  standalone: true,
  imports: [RouterLink, FormsModule, ProviderModoNavComponent],
  templateUrl: './provider-guides-page.component.html',
})
export class ProviderGuidesPageComponent implements OnInit, OnDestroy {
  private readonly commercial = inject(CommercialProviderApiService);
  private searchDebounce: ReturnType<typeof setTimeout> | undefined;

  readonly guides = signal<GuideListItemResponse[]>([]);
  readonly searchQuery = signal('');
  readonly tags = signal<SalesContractTagResponse[]>([]);
  readonly loading = signal(true);
  readonly searching = signal(false);
  readonly error = signal<string | null>(null);
  filterTagId: number | null = null;

  ngOnInit(): void {
    this.commercial.listSalesContractTags().subscribe({
      next: (t) => this.tags.set(t),
      error: () => this.tags.set([]),
    });
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

  onFilterChange(): void {
    this.reload();
  }

  private reload(): void {
    const initial = this.loading();
    if (!initial) {
      this.searching.set(true);
    }
    this.error.set(null);
    this.commercial.listGuides(this.filterTagId, this.searchQuery()).subscribe({
      next: (g) => {
        this.guides.set(g);
        this.loading.set(false);
        this.searching.set(false);
      },
      error: () => {
        this.error.set('No se pudieron cargar los contratos.');
        this.loading.set(false);
        this.searching.set(false);
      },
    });
  }
}
