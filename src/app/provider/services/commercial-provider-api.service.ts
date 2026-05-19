import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import type {
  CampaignCloseReportResponse,
  CampaignResponse,
  ClientRequest,
  ClientResponse,
  CreateGuideRequest,
  CreateSalesContractTagRequest,
  GuideDetailResponse,
  GuideListItemResponse,
  GuideReturnListItemResponse,
  PatchGuideStatusRequest,
  ProviderProfileResponse,
  RegisterClientReturnRequest,
  SalesContractTagResponse,
  UpdateProviderProfileRequest,
  ZoneResponse,
} from './provider-commercial.types';

@Injectable({ providedIn: 'root' })
export class CommercialProviderApiService {
  private readonly http = inject(HttpClient);
  private readonly api = environment.apiBaseUrl;

  listZones(): Observable<ZoneResponse[]> {
    return this.http.get<ZoneResponse[]>(`${this.api}/reference/zones`);
  }

  listCampaigns(): Observable<CampaignResponse[]> {
    return this.http.get<CampaignResponse[]>(`${this.api}/reference/campaigns`);
  }

  listClients(q?: string | null): Observable<ClientResponse[]> {
    let params = new HttpParams();
    const term = q?.trim();
    if (term) {
      params = params.set('q', term);
    }
    return this.http.get<ClientResponse[]>(`${this.api}/clients`, { params });
  }

  getClient(id: number): Observable<ClientResponse> {
    return this.http.get<ClientResponse>(`${this.api}/clients/${id}`);
  }

  createClient(body: ClientRequest): Observable<ClientResponse> {
    return this.http.post<ClientResponse>(`${this.api}/clients`, body);
  }

  updateClient(id: number, body: ClientRequest): Observable<ClientResponse> {
    return this.http.put<ClientResponse>(`${this.api}/clients/${id}`, body);
  }

  deleteClient(id: number): Observable<void> {
    return this.http.delete<void>(`${this.api}/clients/${id}`);
  }

  listSalesContractTags(): Observable<SalesContractTagResponse[]> {
    return this.http.get<SalesContractTagResponse[]>(`${this.api}/sales-contract-tags`);
  }

  createSalesContractTag(body: CreateSalesContractTagRequest): Observable<SalesContractTagResponse> {
    return this.http.post<SalesContractTagResponse>(`${this.api}/sales-contract-tags`, body);
  }

  listGuides(tagId?: number | null, q?: string | null): Observable<GuideListItemResponse[]> {
    let params = new HttpParams();
    if (tagId != null) {
      params = params.set('tagId', String(tagId));
    }
    const term = q?.trim();
    if (term) {
      params = params.set('q', term);
    }
    return this.http.get<GuideListItemResponse[]>(`${this.api}/guides`, { params });
  }

  getGuide(id: number): Observable<GuideDetailResponse> {
    return this.http.get<GuideDetailResponse>(`${this.api}/guides/${id}`);
  }

  createGuide(body: CreateGuideRequest): Observable<GuideDetailResponse> {
    return this.http.post<GuideDetailResponse>(`${this.api}/guides`, body);
  }

  patchGuideStatus(id: number, body: PatchGuideStatusRequest): Observable<GuideDetailResponse> {
    return this.http.patch<GuideDetailResponse>(`${this.api}/guides/${id}/status`, body);
  }

  registerClientReturn(id: number, body: RegisterClientReturnRequest): Observable<GuideDetailResponse> {
    return this.http.post<GuideDetailResponse>(`${this.api}/guides/${id}/client-return`, body);
  }

  listGuideReturns(includeHidden: boolean): Observable<GuideReturnListItemResponse[]> {
    const params = new HttpParams().set('includeHidden', String(includeHidden));
    return this.http.get<GuideReturnListItemResponse[]>(`${this.api}/guides/returns`, { params });
  }

  getProviderProfile(): Observable<ProviderProfileResponse> {
    return this.http.get<ProviderProfileResponse>(`${this.api}/me/provider-profile`);
  }

  updateProviderProfile(body: UpdateProviderProfileRequest): Observable<ProviderProfileResponse> {
    return this.http.put<ProviderProfileResponse>(`${this.api}/me/provider-profile`, body);
  }

  getCampaignCloseReport(campaignId: number): Observable<CampaignCloseReportResponse> {
    return this.http.get<CampaignCloseReportResponse>(
      `${this.api}/provider/campaigns/${campaignId}/close-report`,
    );
  }
}
