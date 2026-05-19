import type { LibraryReconciliationSummaryResponse } from './provider-inventory.types';

export type GuideStatus = 'ACTIVA' | 'CERRADA' | 'DEVUELTA';
export type BookType = 'UNITARIO' | 'PAQUETE';

export interface ZoneResponse {
  id: number;
  name: string;
}

export interface CampaignResponse {
  id: number;
  name: string;
  startsOn: string;
  endsOn: string;
}

export interface ClientResponse {
  id: number;
  fullName: string;
  phone: string | null;
  email: string | null;
  addressNote: string | null;
}

export interface ClientRequest {
  fullName: string;
  phone: string | null;
  addressNote: string | null;
}

export interface SalesContractTagResponse {
  id: number;
  name: string;
}

export interface CreateSalesContractTagRequest {
  name: string;
}

export interface GuideListItemResponse {
  id: number;
  contractNumber: string;
  orderDate: string;
  campaignId: number;
  campaignName: string;
  clientId: number;
  clientName: string;
  status: GuideStatus;
  createdAt: string;
  tags: string[];
}

export interface GuideReturnListItemResponse {
  guideId: number;
  campaignId: number;
  campaignName: string;
  clientId: number;
  clientName: string;
  returnedAt: string;
  reason: string;
  hiddenFromReturnList: boolean;
}

export interface GuideLineResponse {
  id: number;
  bookId: number;
  bookTitle: string;
  bookType: BookType;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface ClientReturnInfoResponse {
  returnedAt: string;
  reason: string | null;
  hiddenFromReturnList: boolean;
}

export interface GuideDetailResponse {
  id: number;
  contractNumber: string;
  orderDate: string;
  campaignId: number;
  campaignName: string;
  clientId: number;
  clientName: string;
  status: GuideStatus;
  createdAt: string;
  note: string | null;
  lines: GuideLineResponse[];
  totalAmount: number;
  tags: string[];
  clientReturn: ClientReturnInfoResponse | null;
}

export interface GuideLineRequest {
  bookId: number;
  quantity: number;
  unitPrice: number;
}

export interface CreateGuideRequest {
  campaignId: number;
  clientId: number;
  contractNumber: string;
  orderDate: string;
  status: GuideStatus | null;
  note: string | null;
  tagIds: number[] | null;
  lines: GuideLineRequest[];
}

export interface CampaignCloseReportResponse {
  campaignId: number;
  campaignName: string;
  startsOn: string;
  endsOn: string;
  guidesActive: number;
  guidesClosed: number;
  guidesReturned: number;
  unitsSold: number;
  totalSoldAmount: number;
  totalToCollect: number;
  totalCollected: number;
  totalPending: number;
  librarySummary: LibraryReconciliationSummaryResponse;
}

export interface PatchGuideStatusRequest {
  status: GuideStatus;
}

export interface RegisterClientReturnRequest {
  reason: string;
  returnedAt: string | null;
  restoreStockToField: boolean;
  hideFromReturnList: boolean;
}

export interface ProviderProfileResponse {
  username: string;
  firstName: string | null;
  lastName: string | null;
  dni: string | null;
  phone: string | null;
  email: string | null;
  career: string | null;
  zoneId: number | null;
  zoneName: string | null;
}

export interface UpdateProviderProfileRequest {
  zoneId: number;
}
