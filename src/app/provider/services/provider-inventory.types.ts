/** Tipos alineados con los records Java del inventario (proveedor). */

/** Solo admin — almacén global. */
export interface WarehouseStockRowResponse {
  bookId: number;
  title: string;
  quantity: number;
}

export interface ProviderBookStockRowResponse {
  bookId: number;
  bookTitle: string;
  categoryId: number;
  categoryName: string;
  purchasedFromLibrary: number;
  returnedToLibrary: number;
  soldOnContracts: number;
  available: number;
}

export interface LibrarySupplyLineItemRequest {
  bookId: number;
  quantity: number;
  discountPercent?: number | null;
}

export interface CreateLibrarySupplyInvoiceRequest {
  invoiceNumber: string;
  issuedOn: string;
  note: string | null;
  lines: LibrarySupplyLineItemRequest[];
  ownerUserId?: number | null;
}

export interface LibrarySupplyInvoiceListItemResponse {
  id: number;
  ownerId: number;
  ownerUsername: string;
  invoiceNumber: string;
  issuedOn: string;
  totalUnits: number;
  totalAmount: number;
  createdAt: string;
}

export interface LibrarySupplyLineResponse {
  id: number;
  bookId: number;
  title: string;
  quantity: number;
  lineTotal: number;
  invoicedQuantity: number;
  returnedQuantity: number;
  netQuantity: number;
}

export interface LibrarySupplyInvoiceDetailResponse {
  id: number;
  ownerId: number;
  ownerUsername: string;
  invoiceNumber: string;
  issuedOn: string;
  note: string | null;
  totalUnits: number;
  totalAmount: number;
  createdAt: string;
  lines: LibrarySupplyLineResponse[];
}

export interface LibraryPaymentListItemResponse {
  id: number;
  amount: number;
  paidOn: string;
  note: string | null;
  campaignId: number | null;
  campaignName: string | null;
  createdAt: string;
}

export interface LibraryPaymentDetailResponse {
  id: number;
  amount: number;
  paidOn: string;
  note: string | null;
  campaignId: number | null;
  campaignName: string | null;
  createdAt: string;
}

export interface CreateLibraryPaymentRequest {
  amount: number;
  paidOn: string;
  note: string | null;
  campaignId: number | null;
}

export interface LibraryStockReturnListItemResponse {
  id: number;
  createdAt: string;
  note: string | null;
  totalUnits: number;
  campaignId: number | null;
  campaignName: string | null;
}

export interface LibraryStockReturnLineResponse {
  invoiceLineId: number;
  bookId: number;
  bookTitle: string;
  quantity: number;
}

export interface LibraryStockReturnDetailResponse {
  id: number;
  createdAt: string;
  note: string | null;
  totalUnits: number;
  campaignId: number | null;
  campaignName: string | null;
  lines: LibraryStockReturnLineResponse[];
}

export interface LibraryStockReturnLineItemRequest {
  bookId: number;
  quantity: number;
}

export type InventoryMovementType =
  | 'WAREHOUSE_ADJUSTMENT'
  | 'WITHDRAWAL_TO_FIELD'
  | 'LIBRARY_INVOICE_ENTRY'
  | 'LIBRARY_STOCK_RETURN'
  | 'CLIENT_RETURN'
  | 'GUIDE_SALE';

export interface InventoryMovementResponse {
  id: number;
  bookId: number;
  bookTitle: string;
  movementType: InventoryMovementType;
  quantityDelta: number;
  warehouseDelta: number;
  fieldDelta: number;
  referenceType: string;
  referenceId: number;
  note: string | null;
  occurredAt: string;
}

export interface CategoryStockSummaryResponse {
  categoryId: number;
  categoryName: string;
  totalAvailable: number;
  books: ProviderBookStockRowResponse[];
}

export interface CreateLibraryStockReturnRequest {
  campaignId: number | null;
  note: string | null;
  lines: LibraryStockReturnLineItemRequest[];
}

export interface LibraryReconciliationSummaryResponse {
  campaignId: number | null;
  campaignName: string | null;
  periodFrom: string | null;
  periodTo: string | null;
  purchasedFromLibraryUnits: number;
  returnedToLibraryUnits: number;
  netPurchasedUnits: number;
  unitsInClosedGuides: number;
  totalInvoicedAmount: number;
  totalDepositsToLibrary: number;
  netBalanceOwedToLibrary: number;
}
