import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import type {
  CalendarDayResponse,
  CustomInstallmentPlanRequest,
  InstallmentRescheduleHistoryItemResponse,
  InstallmentResponse,
  PastDueCollectionItemResponse,
  ProviderBillingTotalsResponse,
  RegisterPaymentRequest,
  RegisterPaymentResponse,
  RescheduleInstallmentRequest,
} from './provider-billing.types';

@Injectable({ providedIn: 'root' })
export class BillingProviderApiService {
  private readonly http = inject(HttpClient);
  private readonly api = environment.apiBaseUrl;

  listInstallments(guideId: number): Observable<InstallmentResponse[]> {
    return this.http.get<InstallmentResponse[]>(`${this.api}/guides/${guideId}/installments`);
  }

  createCustomPlan(guideId: number, body: CustomInstallmentPlanRequest): Observable<InstallmentResponse[]> {
    return this.http.post<InstallmentResponse[]>(
      `${this.api}/guides/${guideId}/installments/plan/custom`,
      body,
    );
  }

  rescheduleInstallment(installmentId: number, body: RescheduleInstallmentRequest): Observable<InstallmentResponse> {
    return this.http.patch<InstallmentResponse>(
      `${this.api}/installments/${installmentId}/due-date`,
      body,
    );
  }

  rescheduleHistory(installmentId: number): Observable<InstallmentRescheduleHistoryItemResponse[]> {
    return this.http.get<InstallmentRescheduleHistoryItemResponse[]>(
      `${this.api}/billing/installments/${installmentId}/reschedules`,
    );
  }

  registerPayment(installmentId: number, body: RegisterPaymentRequest): Observable<RegisterPaymentResponse> {
    return this.http.post<RegisterPaymentResponse>(
      `${this.api}/installments/${installmentId}/payments`,
      body,
    );
  }

  calendar(from: string, to: string): Observable<CalendarDayResponse[]> {
    const params = new HttpParams().set('from', from).set('to', to);
    return this.http.get<CalendarDayResponse[]>(`${this.api}/billing/calendar`, { params });
  }

  billingSummary(campaignId?: number | null): Observable<ProviderBillingTotalsResponse> {
    let params = new HttpParams();
    if (campaignId != null) {
      params = params.set('campaignId', String(campaignId));
    }
    return this.http.get<ProviderBillingTotalsResponse>(`${this.api}/billing/summary`, { params });
  }

  pastDueCollections(campaignId?: number | null): Observable<PastDueCollectionItemResponse[]> {
    let params = new HttpParams();
    if (campaignId != null) {
      params = params.set('campaignId', String(campaignId));
    }
    return this.http.get<PastDueCollectionItemResponse[]>(`${this.api}/billing/collections/past-due`, {
      params,
    });
  }
}
