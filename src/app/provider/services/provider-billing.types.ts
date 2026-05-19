export interface InstallmentResponse {
  id: number;
  guideId: number;
  sequence: number;
  dueDate: string;
  amount: number;
  paidTotal: number;
  remaining: number;
  fullyPaid: boolean;
}

export interface CustomInstallmentItem {
  dueDate: string;
  amount: number;
}

export interface CustomInstallmentPlanRequest {
  items: CustomInstallmentItem[];
}

export interface RegisterPaymentRequest {
  amount: number;
  paidOn: string;
  note: string | null;
}

export interface RegisterPaymentResponse {
  installment: InstallmentResponse;
  clientMessage: string;
}

export interface RescheduleInstallmentRequest {
  dueDate: string;
}

export interface InstallmentRescheduleHistoryItemResponse {
  id: number;
  previousDueDate: string;
  newDueDate: string;
  rescheduledAt: string;
}

export interface InstallmentCalendarItemResponse {
  installmentId: number | null;
  guideId: number | null;
  contractNumber: string;
  clientName: string;
  sequence: number;
  dueDate: string;
  amount: number;
  paidTotal: number;
  remaining: number;
}

export interface CalendarDayResponse {
  date: string;
  pendingCount: number;
  items: InstallmentCalendarItemResponse[];
}

export interface ProviderBillingTotalsResponse {
  campaignId: number | null;
  campaignName: string | null;
  totalToCollect: number;
  totalCollected: number;
  totalPending: number;
  pendingInstallmentCount: number;
  pastDueInstallmentCount: number;
}

export interface PastDueCollectionItemResponse {
  installmentId: number;
  guideId: number;
  contractNumber: string;
  clientId: number;
  clientName: string;
  installmentSeq: number;
  dueDate: string;
  amount: number;
  paidAmount: number;
  pendingAmount: number;
  daysPastDue: number;
}
