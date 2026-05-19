import { DatePipe } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { forkJoin } from 'rxjs';
import { AdminApiService } from '../services/admin-api.service';
import type { AdminDashboardResponse } from '../services/admin.types';

export interface AdminBarItem {
  label: string;
  value: number;
  tone: string;
}

@Component({
  selector: 'app-admin-dashboard-page',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './admin-dashboard-page.component.html',
  styleUrl: './admin-dashboard-page.component.scss',
})
export class AdminDashboardPageComponent implements OnInit {
  private readonly admin = inject(AdminApiService);

  readonly data = signal<AdminDashboardResponse | null>(null);
  readonly providerCount = signal(0);
  readonly userCount = signal(0);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly loadedAt = signal<Date | null>(null);

  readonly guideBars = computed((): AdminBarItem[] => {
    const d = this.data();
    if (!d) return [];
    return [
      { label: 'Activas', value: d.guidesByStatus.activa, tone: 'active' },
      { label: 'Cerradas', value: d.guidesByStatus.cerrada, tone: 'closed' },
      { label: 'Devueltas', value: d.guidesByStatus.devuelta, tone: 'returned' },
    ];
  });

  readonly stockBars = computed((): AdminBarItem[] => {
    const d = this.data();
    if (!d) return [];
    return [
      { label: 'Almacén', value: d.totalWarehouseUnits, tone: 'warehouse' },
      { label: 'Campo', value: d.totalFieldStockUnits, tone: 'field' },
      { label: 'Compra librería', value: d.totalLibraryPurchasedUnits, tone: 'library' },
    ];
  });

  readonly topBookBars = computed(() => {
    const d = this.data();
    if (!d?.topBooksClosedGuides.length) return [];
    const max = Math.max(...d.topBooksClosedGuides.map((b) => b.units), 1);
    return d.topBooksClosedGuides.map((b) => ({
      label: b.title,
      value: b.units,
      tone: 'book',
      pct: this.barWidth(b.units, max),
    }));
  });

  readonly maxGuideValue = computed(() => this.maxOf(this.guideBars()));
  readonly maxStockValue = computed(() => this.maxOf(this.stockBars()));
  readonly totalGuides = computed(() => {
    const d = this.data();
    if (!d) return 0;
    const g = d.guidesByStatus;
    return g.activa + g.cerrada + g.devuelta;
  });

  ngOnInit(): void {
    forkJoin({
      dashboard: this.admin.getDashboard(),
      users: this.admin.listUsers(),
      providers: this.admin.listProviders(),
    }).subscribe({
      next: ({ dashboard, users, providers }) => {
        this.data.set(dashboard);
        this.userCount.set(users.length);
        this.providerCount.set(providers.length);
        this.loadedAt.set(new Date());
        this.loading.set(false);
      },
      error: () => {
        this.error.set('No se pudo cargar el reporte. Verifica que el backend esté disponible.');
        this.loading.set(false);
      },
    });
  }

  barWidth(value: number, max: number): number {
    if (max <= 0 || value <= 0) return 0;
    return Math.round(Math.max(6, (value / max) * 100));
  }

  private maxOf(items: AdminBarItem[]): number {
    if (!items.length) return 1;
    return Math.max(...items.map((i) => i.value), 1);
  }
}
