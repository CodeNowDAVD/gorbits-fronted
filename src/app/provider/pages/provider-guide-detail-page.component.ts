import { DecimalPipe, NgClass } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormArray, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ProviderModoNavComponent } from '../components/provider-modo-nav.component';
import { BillingProviderApiService } from '../services/billing-provider-api.service';
import { CommercialProviderApiService } from '../services/commercial-provider-api.service';
import type { GuideDetailResponse, GuideStatus } from '../services/provider-commercial.types';
import type {
  InstallmentRescheduleHistoryItemResponse,
  InstallmentResponse,
} from '../services/provider-billing.types';

@Component({
  selector: 'app-provider-guide-detail-page',
  standalone: true,
  imports: [RouterLink, DecimalPipe, NgClass, ReactiveFormsModule, ProviderModoNavComponent],
  templateUrl: './provider-guide-detail-page.component.html',
})
export class ProviderGuideDetailPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly commercial = inject(CommercialProviderApiService);
  private readonly billing = inject(BillingProviderApiService);
  private readonly fb = inject(FormBuilder);

  readonly guide = signal<GuideDetailResponse | null>(null);
  readonly installments = signal<InstallmentResponse[]>([]);
  readonly rescheduleHistory = signal<InstallmentRescheduleHistoryItemResponse[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly busy = signal(false);
  readonly billingBusy = signal(false);
  readonly actionError = signal<string | null>(null);
  readonly billingErr = signal<string | null>(null);
  readonly billingNotice = signal<string | null>(null);
  readonly returnPanelOpen = signal(false);
  readonly paymentPanelOpen = signal(false);
  readonly reschedulePanelOpen = signal(false);
  readonly planPanelOpen = signal(false);
  readonly statusSaving = signal(false);

  private guideId!: number;

  readonly statusForm = this.fb.nonNullable.group({
    status: ['ACTIVA' as GuideStatus, Validators.required],
  });

  readonly returnForm = this.fb.nonNullable.group({
    reason: ['', Validators.required],
    returnedAt: [''],
    restoreStockToField: [true],
    hideFromReturnList: [false],
  });

  readonly customPlanForm = this.fb.nonNullable.group({
    items: this.fb.array([this.customPlanRow()]),
  });

  readonly payForm = this.fb.nonNullable.group({
    installmentId: [null as unknown as number, Validators.required],
    amount: [null as unknown as number, [Validators.required, Validators.min(0.01)]],
    paidOn: ['', Validators.required],
    note: [''],
  });

  readonly rescheduleForm = this.fb.nonNullable.group({
    installmentId: [null as unknown as number, Validators.required],
    dueDate: ['', Validators.required],
  });

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('guideId'));
    if (!Number.isFinite(id)) {
      this.error.set('Guía no válida.');
      this.loading.set(false);
      return;
    }
    this.guideId = id;
    this.reload();
  }

  private customPlanRow() {
    return this.fb.nonNullable.group({
      dueDate: ['', Validators.required],
      amount: [null as unknown as number, [Validators.required, Validators.min(0.01)]],
    });
  }

  get customItems(): FormArray {
    return this.customPlanForm.controls.items as FormArray;
  }

  addCustomRow(): void {
    this.customItems.push(this.customPlanRow());
  }

  removeCustomRow(i: number): void {
    if (this.customItems.length > 1) this.customItems.removeAt(i);
  }

  isReadOnly(g: GuideDetailResponse): boolean {
    return g.status === 'DEVUELTA' || g.clientReturn != null;
  }

  onStatusChange(): void {
    const g = this.guide();
    if (!g || this.isReadOnly(g) || this.statusForm.invalid) return;
    if (this.statusForm.getRawValue().status === g.status) return;
    this.saveStatus();
  }

  openPaymentPanel(): void {
    this.closeEditablePanels();
    this.paymentPanelOpen.set(true);
  }

  closePaymentPanel(): void {
    this.paymentPanelOpen.set(false);
  }

  openReschedulePanel(): void {
    this.closeEditablePanels();
    this.reschedulePanelOpen.set(true);
  }

  closeReschedulePanel(): void {
    this.reschedulePanelOpen.set(false);
    this.rescheduleHistory.set([]);
  }

  openPlanPanel(): void {
    this.closeEditablePanels();
    this.planPanelOpen.set(true);
  }

  closePlanPanel(): void {
    this.planPanelOpen.set(false);
  }

  closeEditablePanels(): void {
    this.paymentPanelOpen.set(false);
    this.reschedulePanelOpen.set(false);
    this.planPanelOpen.set(false);
    this.returnPanelOpen.set(false);
    this.rescheduleHistory.set([]);
  }

  reload(): void {
    this.loading.set(true);
    this.actionError.set(null);
    this.commercial.getGuide(this.guideId).subscribe({
      next: (g) => {
        this.guide.set(g);
        this.statusForm.controls.status.setValue(g.status);
        if (this.isReadOnly(g)) {
          this.closeEditablePanels();
        }
        this.loading.set(false);
      },
      error: () => {
        this.error.set('No se pudo cargar la guía.');
        this.loading.set(false);
      },
    });
    this.reloadInstallments();
  }

  reloadInstallments(): void {
    this.billing.listInstallments(this.guideId).subscribe({
      next: (rows) => this.installments.set(rows),
      error: () => this.installments.set([]),
    });
  }

  loadRescheduleHistory(): void {
    const id = Number(this.rescheduleForm.getRawValue().installmentId);
    if (!Number.isFinite(id)) {
      this.rescheduleHistory.set([]);
      return;
    }
    this.billing.rescheduleHistory(id).subscribe({
      next: (h) => this.rescheduleHistory.set(h),
      error: () => this.rescheduleHistory.set([]),
    });
  }

  saveStatus(): void {
    if (this.statusForm.invalid) return;
    const previous = this.guide()?.status;
    this.statusSaving.set(true);
    this.actionError.set(null);
    this.commercial.patchGuideStatus(this.guideId, { status: this.statusForm.getRawValue().status }).subscribe({
      next: (g) => {
        this.guide.set(g);
        this.statusSaving.set(false);
      },
      error: (err) => {
        this.statusSaving.set(false);
        if (previous) {
          this.statusForm.controls.status.setValue(previous);
        }
        this.actionError.set(this.apiErrorMessage(err, 'No se pudo actualizar el estado.'));
      },
    });
  }

  openReturnPanel(): void {
    this.closeEditablePanels();
    this.returnPanelOpen.set(true);
  }

  closeReturnPanel(): void {
    this.returnPanelOpen.set(false);
    this.returnForm.reset({
      reason: '',
      returnedAt: '',
      restoreStockToField: true,
      hideFromReturnList: false,
    });
  }

  submitReturn(): void {
    if (this.returnForm.invalid) return;
    const v = this.returnForm.getRawValue();
    const returnedAt =
      v.returnedAt && v.returnedAt.trim().length > 0 ? new Date(v.returnedAt).toISOString() : null;
    this.busy.set(true);
    this.actionError.set(null);
    this.commercial
      .registerClientReturn(this.guideId, {
        reason: v.reason.trim(),
        returnedAt,
        restoreStockToField: v.restoreStockToField,
        hideFromReturnList: v.hideFromReturnList,
      })
      .subscribe({
        next: (g) => {
          this.guide.set(g);
          this.busy.set(false);
          this.closeReturnPanel();
          this.closeEditablePanels();
        },
        error: (err) => {
          this.busy.set(false);
          this.actionError.set(this.apiErrorMessage(err, 'No se pudo registrar la devolución.'));
        },
      });
  }

  submitCustomPlan(): void {
    if (this.customPlanForm.invalid) {
      this.customPlanForm.markAllAsTouched();
      return;
    }
    const rows = this.customItems.getRawValue();
    this.billingBusy.set(true);
    this.billingErr.set(null);
    this.billingNotice.set(null);
    this.billing
      .createCustomPlan(this.guideId, {
        items: rows.map((r) => ({
          dueDate: r.dueDate,
          amount: Number(r.amount),
        })),
      })
      .subscribe({
        next: () => {
          this.billingBusy.set(false);
          this.reloadInstallments();
          this.billingNotice.set('Plan de cuotas creado.');
          this.closePlanPanel();
        },
        error: (err) => {
          this.billingBusy.set(false);
          this.billingErr.set(this.apiErrorMessage(err, 'No se pudo crear el plan.'));
        },
      });
  }

  submitPayment(): void {
    if (this.payForm.invalid) {
      this.payForm.markAllAsTouched();
      return;
    }
    const v = this.payForm.getRawValue();
    const id = Number(v.installmentId);
    this.billingBusy.set(true);
    this.billingErr.set(null);
    this.billingNotice.set(null);
    this.billing
      .registerPayment(id, {
        amount: Number(v.amount),
        paidOn: v.paidOn,
        note: v.note.trim() ? v.note.trim() : null,
      })
      .subscribe({
        next: (res) => {
          this.billingBusy.set(false);
          this.reloadInstallments();
          this.billingNotice.set(res.clientMessage?.trim() || 'Pago registrado.');
          this.closePaymentPanel();
          this.payForm.reset({
            installmentId: null as unknown as number,
            amount: null as unknown as number,
            paidOn: '',
            note: '',
          });
        },
        error: (err) => {
          this.billingBusy.set(false);
          this.billingErr.set(this.apiErrorMessage(err, 'No se pudo registrar el pago.'));
        },
      });
  }

  submitReschedule(): void {
    if (this.rescheduleForm.invalid) {
      this.rescheduleForm.markAllAsTouched();
      return;
    }
    const v = this.rescheduleForm.getRawValue();
    const id = Number(v.installmentId);
    this.billingBusy.set(true);
    this.billingErr.set(null);
    this.billingNotice.set(null);
    this.billing.rescheduleInstallment(id, { dueDate: v.dueDate }).subscribe({
      next: () => {
        this.billingBusy.set(false);
        this.reloadInstallments();
        this.loadRescheduleHistory();
        this.billingNotice.set('Vencimiento actualizado.');
        this.closeReschedulePanel();
      },
      error: (err) => {
        this.billingBusy.set(false);
        this.billingErr.set(this.apiErrorMessage(err, 'No se pudo reprogramar.'));
      },
    });
  }

  pendingInstallments(): InstallmentResponse[] {
    return this.installments().filter((i) => !i.fullyPaid);
  }

  billingPaidTotal(): number {
    return this.installments().reduce((sum, row) => sum + row.paidTotal, 0);
  }

  billingPendingTotal(): number {
    return this.installments().reduce((sum, row) => sum + row.remaining, 0);
  }

  statusLabel(status: GuideStatus): string {
    switch (status) {
      case 'ACTIVA':
        return 'Activa';
      case 'CERRADA':
        return 'Cerrada';
      case 'DEVUELTA':
        return 'Devuelta';
      default:
        return status;
    }
  }

  statusBadgeClass(status: GuideStatus): string {
    switch (status) {
      case 'ACTIVA':
        return 'focus-badge--ok';
      case 'DEVUELTA':
        return 'focus-badge--alert';
      default:
        return 'focus-badge--muted';
    }
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

  private apiErrorMessage(err: unknown, fallback: string): string {
    if (err instanceof HttpErrorResponse) {
      const msg = err.error?.error ?? err.error?.message;
      if (typeof msg === 'string' && msg.trim().length > 0) {
        return msg;
      }
    }
    return fallback;
  }
}
