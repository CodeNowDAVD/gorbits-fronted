import { SlicePipe } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ProviderModoNavComponent } from '../components/provider-modo-nav.component';
import { CommercialProviderApiService } from '../services/commercial-provider-api.service';
import type { GuideReturnListItemResponse } from '../services/provider-commercial.types';

@Component({
  selector: 'app-provider-guide-returns-page',
  standalone: true,
  imports: [FormsModule, RouterLink, SlicePipe, ProviderModoNavComponent],
  templateUrl: './provider-guide-returns-page.component.html',
})
export class ProviderGuideReturnsPageComponent implements OnInit {
  private readonly commercial = inject(CommercialProviderApiService);

  includeHidden = false;
  readonly rows = signal<GuideReturnListItemResponse[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  ngOnInit(): void {
    this.reload();
  }

  formatDateTime(iso: string): string {
    if (!iso?.trim()) {
      return '—';
    }
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) {
      return iso;
    }
    return date.toLocaleString('es-MX', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  reload(): void {
    this.loading.set(true);
    this.error.set(null);
    this.commercial.listGuideReturns(this.includeHidden).subscribe({
      next: (r) => {
        this.rows.set(r);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('No se pudieron cargar las devoluciones.');
        this.loading.set(false);
      },
    });
  }
}
