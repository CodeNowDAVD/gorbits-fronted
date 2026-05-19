import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ProviderModoNavComponent } from '../components/provider-modo-nav.component';
import { CommercialProviderApiService } from '../services/commercial-provider-api.service';

@Component({
  selector: 'app-provider-modo-campo-page',
  standalone: true,
  imports: [RouterLink, ProviderModoNavComponent],
  templateUrl: './provider-modo-campo-page.component.html',
})
export class ProviderModoCampoPageComponent implements OnInit {
  private readonly commercial = inject(CommercialProviderApiService);

  readonly activeGuides = signal(0);
  readonly loading = signal(true);

  ngOnInit(): void {
    this.commercial.listGuides().subscribe({
      next: (rows) => {
        this.activeGuides.set(rows.filter((g) => g.status === 'ACTIVA').length);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }
}
