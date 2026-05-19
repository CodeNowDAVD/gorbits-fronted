import { DecimalPipe } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ProviderModoNavComponent } from '../components/provider-modo-nav.component';
import { BillingProviderApiService } from '../services/billing-provider-api.service';
import type { CalendarDayResponse } from '../services/provider-billing.types';

function formatIsoDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function monthRange(ref: Date): { from: string; to: string } {
  const from = new Date(ref.getFullYear(), ref.getMonth(), 1);
  const to = new Date(ref.getFullYear(), ref.getMonth() + 1, 0);
  return { from: formatIsoDate(from), to: formatIsoDate(to) };
}

@Component({
  selector: 'app-provider-billing-calendar-page',
  standalone: true,
  imports: [ReactiveFormsModule, DecimalPipe, RouterLink, ProviderModoNavComponent],
  templateUrl: './provider-billing-calendar-page.component.html',
})
export class ProviderBillingCalendarPageComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly billing = inject(BillingProviderApiService);

  readonly days = signal<CalendarDayResponse[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  readonly form = this.fb.nonNullable.group({
    from: ['', Validators.required],
    to: ['', Validators.required],
  });

  ngOnInit(): void {
    const { from, to } = monthRange(new Date());
    this.form.patchValue({ from, to });
    this.load();
  }

  load(): void {
    if (this.form.invalid) return;
    const { from, to } = this.form.getRawValue();
    this.loading.set(true);
    this.error.set(null);
    this.billing.calendar(from, to).subscribe({
      next: (d) => {
        this.days.set(d);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('No se pudo cargar el calendario.');
        this.loading.set(false);
      },
    });
  }

  daysWithItems(): CalendarDayResponse[] {
    return this.days().filter((day) => day.pendingCount > 0 || day.items.length > 0);
  }
}
