import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import type {
  CategoryStockSummaryResponse,
  CreateLibraryPaymentRequest,
  CreateLibraryStockReturnRequest,
  CreateLibrarySupplyInvoiceRequest,
  InventoryMovementResponse,
  LibraryPaymentDetailResponse,
  LibraryPaymentListItemResponse,
  LibraryReconciliationSummaryResponse,
  LibraryStockReturnDetailResponse,
  LibraryStockReturnListItemResponse,
  LibrarySupplyInvoiceDetailResponse,
  LibrarySupplyInvoiceListItemResponse,
  ProviderBookStockRowResponse,
  WarehouseStockRowResponse,
} from './provider-inventory.types';

@Injectable({ providedIn: 'root' })
export class InventoryProviderApiService {
  private readonly http = inject(HttpClient);
  private readonly root = `${environment.apiBaseUrl}/inventory`;

  /** Almacén global (solo rol admin; el proveedor no usa esta ruta en UI). */
  listWarehouseStock(): Observable<WarehouseStockRowResponse[]> {
    return this.http.get<WarehouseStockRowResponse[]>(`${this.root}/warehouse`);
  }

  listMyStock(): Observable<ProviderBookStockRowResponse[]> {
    return this.http.get<ProviderBookStockRowResponse[]>(`${this.root}/my-stock`);
  }

  listMovements(): Observable<InventoryMovementResponse[]> {
    return this.http.get<InventoryMovementResponse[]>(`${this.root}/movements`);
  }

  stockByCategory(): Observable<CategoryStockSummaryResponse[]> {
    return this.http.get<CategoryStockSummaryResponse[]>(`${this.root}/stock/by-category`);
  }

  listLibraryInvoices(providerId?: number | null): Observable<LibrarySupplyInvoiceListItemResponse[]> {
    let params = new HttpParams();
    if (providerId != null) {
      params = params.set('providerId', String(providerId));
    }
    return this.http.get<LibrarySupplyInvoiceListItemResponse[]>(`${this.root}/library-invoices`, {
      params,
    });
  }

  getLibraryInvoice(id: number): Observable<LibrarySupplyInvoiceDetailResponse> {
    return this.http.get<LibrarySupplyInvoiceDetailResponse>(`${this.root}/library-invoices/${id}`);
  }

  createLibraryInvoice(
    body: CreateLibrarySupplyInvoiceRequest,
  ): Observable<LibrarySupplyInvoiceDetailResponse> {
    return this.http.post<LibrarySupplyInvoiceDetailResponse>(`${this.root}/library-invoices`, body);
  }

  listLibraryPayments(): Observable<LibraryPaymentListItemResponse[]> {
    return this.http.get<LibraryPaymentListItemResponse[]>(`${this.root}/library-payments`);
  }

  getLibraryPayment(id: number): Observable<LibraryPaymentDetailResponse> {
    return this.http.get<LibraryPaymentDetailResponse>(`${this.root}/library-payments/${id}`);
  }

  createLibraryPayment(body: CreateLibraryPaymentRequest): Observable<LibraryPaymentDetailResponse> {
    return this.http.post<LibraryPaymentDetailResponse>(`${this.root}/library-payments`, body);
  }

  listLibraryStockReturns(): Observable<LibraryStockReturnListItemResponse[]> {
    return this.http.get<LibraryStockReturnListItemResponse[]>(`${this.root}/library-stock-returns`);
  }

  getLibraryStockReturn(id: number): Observable<LibraryStockReturnDetailResponse> {
    return this.http.get<LibraryStockReturnDetailResponse>(`${this.root}/library-stock-returns/${id}`);
  }

  createLibraryStockReturn(
    body: CreateLibraryStockReturnRequest,
  ): Observable<LibraryStockReturnDetailResponse> {
    return this.http.post<LibraryStockReturnDetailResponse>(`${this.root}/library-stock-returns`, body);
  }

  libraryReconciliationSummary(campaignId?: number | null): Observable<LibraryReconciliationSummaryResponse> {
    let params = new HttpParams();
    if (campaignId != null) {
      params = params.set('campaignId', String(campaignId));
    }
    return this.http.get<LibraryReconciliationSummaryResponse>(
      `${this.root}/library-reconciliation/summary`,
      { params },
    );
  }
}
