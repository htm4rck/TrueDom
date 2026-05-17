import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@/environments/environment';
import { Observable, map } from 'rxjs';

interface ApiResponse<T> {
  data: T;
}

export interface PendienteDominio {
  id: number;
  dominio: string;
  totalRegistros: number;
  totalUsuarios: number;
  totalVp: number;
  vicepresidencias: string | null;
  ultimaActividad: string | null;
  politicas: string | null;
  estado: string;
}

export interface PendienteDestinatario {
  id: number;
  destinatario: string;
  dominio: string;
  correoUsuarioAlicorp: string;
  estado: string;
  fechaLimite: string | null;
}

export interface CatalogoDominio {
  id: number;
  dominio: string;
  activo: boolean;
  justificacion: string;
  creadoPor: string;
  fechaCreacion: string;
}

export interface CatalogoDestinatario {
  id: number;
  destinatario: string;
  correoUsuarioAlicorp: string;
  activo: boolean;
  justificacion: string;
  creadoPor: string;
  fechaCreacion: string;
}

export interface Inconsistencia {
  id: number;
  destinatario: string;
  dominio: string;
  estado: string;
  decisionFinal: string | null;
  resueltoPor: string | null;
  fechaCreacion: string;
}

export interface Auditoria {
  id: number;
  entidad: string;
  entidadId: number;
  accion: string;
  usuario: string;
  fechaEvento: string;
}

@Injectable({ providedIn: 'root' })
export class DlpApiService {
  private http = inject(HttpClient);
  private base = environment.apiUrl;

  // --- Dominios ---
  getDominiosPendientes(): Observable<PendienteDominio[]> {
    return this.http.get<ApiResponse<PendienteDominio[]>>(`${this.base}/dominios/pendientes`).pipe(map((r) => r.data));
  }

  getDetallePendienteDominio(id: number): Observable<any[]> {
    return this.http.get<ApiResponse<any[]>>(`${this.base}/dominios/pendientes/${id}/detalle`).pipe(map((r) => r.data));
  }

  validarDominio(id: number, decision: string, justificacion: string, usuario: string): Observable<void> {
    return this.http.post<void>(`${this.base}/dominios/pendientes/${id}/validar`, { decision, justificacion, usuario });
  }

  getDominiosBlancos(): Observable<CatalogoDominio[]> {
    return this.http.get<ApiResponse<CatalogoDominio[]>>(`${this.base}/dominios/blancos`).pipe(map((r) => r.data));
  }

  getDominiosNegros(): Observable<CatalogoDominio[]> {
    return this.http.get<ApiResponse<CatalogoDominio[]>>(`${this.base}/dominios/negros`).pipe(map((r) => r.data));
  }

  agregarDominioBlanco(dominio: string, justificacion: string, usuario: string): Observable<CatalogoDominio> {
    return this.http.post<ApiResponse<CatalogoDominio>>(`${this.base}/dominios/blancos`, { dominio, justificacion, usuario }).pipe(map((r) => r.data));
  }

  agregarDominioNegro(dominio: string, justificacion: string, usuario: string): Observable<CatalogoDominio> {
    return this.http.post<ApiResponse<CatalogoDominio>>(`${this.base}/dominios/negros`, { dominio, justificacion, usuario }).pipe(map((r) => r.data));
  }

  toggleDominio(id: number, blanco: boolean, usuario: string): Observable<void> {
    return this.http.put<void>(`${this.base}/dominios/${id}/toggle?blanco=${blanco}&usuario=${usuario}`, {});
  }

  eliminarDominioBlanco(id: number, usuario: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/dominios/blancos/${id}?usuario=${usuario}`);
  }

  eliminarDominioNegro(id: number, usuario: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/dominios/negros/${id}?usuario=${usuario}`);
  }

  // --- Destinatarios ---
  getMisPendientes(correo: string): Observable<PendienteDestinatario[]> {
    return this.http.get<ApiResponse<PendienteDestinatario[]>>(`${this.base}/destinatarios/mis-pendientes?correo=${correo}`).pipe(map((r) => r.data));
  }

  getPendientesDestinatarios(anios?: number[], meses?: number[]): Observable<PendienteDestinatario[]> {
    let params = '';
    if (anios?.length) params += anios.map((a) => `anios=${a}`).join('&');
    if (meses?.length) params += (params ? '&' : '') + meses.map((m) => `meses=${m}`).join('&');
    return this.http.get<ApiResponse<PendienteDestinatario[]>>(`${this.base}/destinatarios/pendientes${params ? '?' + params : ''}`).pipe(map((r) => r.data));
  }

  getPeriodosDisponibles(): Observable<{ anio: number; meses: number[] }[]> {
    return this.http.get<ApiResponse<{ anio: number; meses: number[] }[]>>(`${this.base}/destinatarios/periodos-disponibles`).pipe(map((r) => r.data));
  }

  validarDestinatario(id: number, decision: string, justificacion: string, usuario: string): Observable<void> {
    return this.http.post<void>(`${this.base}/destinatarios/pendientes/${id}/validar`, { decision, justificacion, usuario });
  }

  getDestinatariosBlancos(): Observable<CatalogoDestinatario[]> {
    return this.http.get<ApiResponse<CatalogoDestinatario[]>>(`${this.base}/destinatarios/blancos`).pipe(map((r) => r.data));
  }

  getDestinatariosNegros(): Observable<CatalogoDestinatario[]> {
    return this.http.get<ApiResponse<CatalogoDestinatario[]>>(`${this.base}/destinatarios/negros`).pipe(map((r) => r.data));
  }

  eliminarDestinatarioBlanco(id: number, usuario: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/destinatarios/blancos/${id}?usuario=${usuario}`);
  }

  eliminarDestinatarioNegro(id: number, usuario: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/destinatarios/negros/${id}?usuario=${usuario}`);
  }

  // --- Inconsistencias ---
  getInconsistencias(): Observable<Inconsistencia[]> {
    return this.http.get<ApiResponse<Inconsistencia[]>>(`${this.base}/inconsistencias`).pipe(map((r) => r.data));
  }

  getInconsistenciaDetalle(id: number): Observable<any> {
    return this.http.get<ApiResponse<any>>(`${this.base}/inconsistencias/${id}`).pipe(map((r) => r.data));
  }

  resolverInconsistencia(id: number, decisionFinal: string, justificacion: string, usuario: string): Observable<void> {
    return this.http.post<void>(`${this.base}/inconsistencias/${id}/resolver`, { decisionFinal, justificacion, usuario });
  }

  // --- Auditoria ---
  getAuditoria(): Observable<Auditoria[]> {
    return this.http.get<ApiResponse<Auditoria[]>>(`${this.base}/auditoria`).pipe(map((r) => r.data));
  }
}
