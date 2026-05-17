import { Component, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DatePipe, DecimalPipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { environment } from '@/environments/environment';
import { WebSocketService, ProgresoLote } from '../services/websocket.service';

@Component({
  selector: 'dlp-lote-detalle',
  imports: [DatePipe, DecimalPipe, MatButtonModule, MatCardModule, MatIconModule, MatProgressBarModule, RouterLink],
  template: `
    <div class="mx-auto flex w-full max-w-7xl flex-auto flex-col gap-5 p-6 lg:p-8">
      <div class="flex items-end gap-4">
        <div>
          <div class="text-2xl font-semibold tracking-tight">Detalle del lote #{{ lote()?.id }}</div>
          <div class="mt-1 text-sm text-neutral-500">Periodo {{ lote()?.periodoAnio }}-{{ lote()?.periodoMes }} | Estado: {{ lote()?.estado }}</div>
        </div>
        <div class="flex-auto"></div>
        <a matButton="tonal" routerLink="/admin/dlp/lotes"><mat-icon svgIcon="arrow-left" />Volver</a>
        @if (lote()?.estado === 'VALIDADO' && !progreso()) {
          <button matButton="filled" (click)="procesar()"><mat-icon svgIcon="play" />Procesar</button>
        }
        @if (lote()?.estado === 'CON_OBSERVACIONES' || lote()?.estado === 'PROCESADO') {
          <a matButton="filled" [routerLink]="['/admin/lotes', lote()?.id, 'resultado']"><mat-icon svgIcon="chart-column" />Ver resultados</a>
        }
      </div>

      @if (progreso(); as p) {
        <!-- Progress view -->
        <mat-card appearance="filled">
          <mat-card-content class="py-8">
            <div class="flex flex-col items-center gap-4">
              @if (p.fase === 'COMPLETADO') {
                <mat-icon class="size-12 text-[#3f9829]" svgIcon="circle-check" />
                <div class="text-xl font-bold text-[#071B2A]">Procesamiento completado</div>
              } @else if (p.fase === 'ERROR') {
                <mat-icon class="size-12 text-red-600" svgIcon="circle-x" />
                <div class="text-xl font-bold text-red-600">Error en el procesamiento</div>
              } @else {
                <mat-icon class="size-12 text-[#2D7FF9] animate-pulse" svgIcon="loader" />
                <div class="text-xl font-bold text-[#071B2A]">Procesando registros...</div>
              }

              <div class="w-full max-w-lg">
                <mat-progress-bar [mode]="p.fase === 'COMPLETADO' ? 'determinate' : 'buffer'" [value]="p.porcentaje" [bufferValue]="p.porcentaje + 5" />
              </div>

              <div class="text-center">
                <div class="text-3xl font-black text-[#071B2A]">{{ p.porcentaje }}%</div>
                <div class="mt-1 text-sm text-neutral-500">{{ p.mensaje }}</div>
              </div>

              <div class="mt-4 grid grid-cols-3 gap-6 text-center text-sm">
                <div>
                  <div class="text-2xl font-bold text-[#071B2A]">{{ p.registrosLeidos | number }}</div>
                  <div class="text-neutral-500">Procesados</div>
                </div>
                <div>
                  <div class="text-2xl font-bold text-[#071B2A]">{{ p.dominiosEncontrados }}</div>
                  <div class="text-neutral-500">Dominios nuevos</div>
                </div>
                <div>
                  <div class="text-2xl font-bold text-[#071B2A]">{{ p.destinatariosEncontrados }}</div>
                  <div class="text-neutral-500">Dest. pendientes</div>
                </div>
              </div>

              @if (p.fase === 'COMPLETADO') {
                <button class="mt-6" matButton="filled" (click)="irAResultados()">
                  <mat-icon svgIcon="chart-column" />Ver resultados del procesamiento
                </button>
              }
            </div>
          </mat-card-content>
        </mat-card>
      } @else {
        <!-- Stats cards -->
        <div class="grid gap-4 md:grid-cols-4">
          <mat-card appearance="filled"><mat-card-content><div class="text-sm text-neutral-500">Cargados</div><div class="text-2xl font-semibold">{{ lote()?.registrosCargados | number }}</div></mat-card-content></mat-card>
          <mat-card appearance="filled"><mat-card-content><div class="text-sm text-neutral-500">Procesados</div><div class="text-2xl font-semibold">{{ lote()?.registrosProcesados | number }}</div></mat-card-content></mat-card>
          <mat-card appearance="filled"><mat-card-content><div class="text-sm text-neutral-500">Usuario</div><div class="text-2xl font-semibold truncate">{{ lote()?.usuarioCarga }}</div></mat-card-content></mat-card>
          <mat-card appearance="filled"><mat-card-content><div class="text-sm text-neutral-500">Fecha</div><div class="text-2xl font-semibold">{{ lote()?.fechaCarga | date:'short' }}</div></mat-card-content></mat-card>
        </div>

        <!-- Records table -->
        <mat-card appearance="filled">
          <mat-card-header><div class="font-medium">Registros (primeros 50)</div></mat-card-header>
          <mat-card-content class="overflow-auto p-0">
            <table class="w-full min-w-[1200px] text-left text-xs">
              <thead class="text-neutral-500 bg-neutral-50 dark:bg-neutral-800/50">
                <tr>
                  <th class="px-3 py-2">Fecha</th>
                  <th class="px-3 py-2">Política</th>
                  <th class="px-3 py-2">Remitente</th>
                  <th class="px-3 py-2">Dominio</th>
                  <th class="px-3 py-2">Destinatario</th>
                  <th class="px-3 py-2">Usuario Alicorp</th>
                  <th class="px-3 py-2">VP</th>
                  <th class="px-3 py-2">Dirección/Gerencia</th>
                  <th class="px-3 py-2">Incident ID</th>
                </tr>
              </thead>
              <tbody>
                @for (r of registros(); track r.id) {
                  <tr class="border-t border-neutral-100 dark:border-neutral-800">
                    <td class="px-3 py-2 text-neutral-500 whitespace-nowrap">{{ r.fechaEvento | date:'short' }}</td>
                    <td class="px-3 py-2">{{ r.nombrePolitica }}</td>
                    <td class="px-3 py-2 max-w-40 truncate" [title]="r.fromUser">{{ r.fromUser }}</td>
                    <td class="px-3 py-2 font-medium">{{ r.dominioExt }}</td>
                    <td class="px-3 py-2">{{ r.destinatarioExt }}</td>
                    <td class="px-3 py-2">{{ r.correoUsuarioAlicorp }}</td>
                    <td class="px-3 py-2 max-w-32 truncate" [title]="r.vicepresidenciaUsuario">{{ r.vicepresidenciaUsuario }}</td>
                    <td class="px-3 py-2 max-w-40 truncate" [title]="r.direccionGerenciaUsuario">{{ r.direccionGerenciaUsuario }}</td>
                    <td class="px-3 py-2 text-neutral-400 text-[10px]">{{ r.dlpIncidentId }}</td>
                  </tr>
                } @empty {
                  <tr><td colspan="9" class="px-4 py-8 text-center text-neutral-400">Sin registros</td></tr>
                }
              </tbody>
            </table>
          </mat-card-content>
        </mat-card>
      }
    </div>
  `,
})
export default class LoteDetallePage {
  private http = inject(HttpClient);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private wsService = inject(WebSocketService);

  protected lote = signal<any>(null);
  protected registros = signal<any[]>([]);
  protected progreso = this.wsService.progreso;

  private loteId: number;

  constructor() {
    this.loteId = +this.route.snapshot.params['id'];
    this.http.get<any>(`${environment.apiUrl}/lotes/${this.loteId}`).subscribe((res) => this.lote.set(res.data));
    this.http.get<any>(`${environment.apiUrl}/lotes/${this.loteId}/registros`).subscribe((res) => this.registros.set(res.data || []));

    // If there's active progress for this lote, show it
    const p = this.wsService.progreso();
    if (p && p.loteId === this.loteId && p.fase !== 'COMPLETADO' && p.fase !== 'ERROR') {
      // Already subscribed, progress will update
    }
  }

  procesar() {
    this.wsService.progreso.set({
      loteId: this.loteId, fase: 'INICIANDO', registrosLeidos: 0,
      totalEstimado: 0, porcentaje: 0, dominiosEncontrados: 0,
      destinatariosEncontrados: 0, mensaje: 'Iniciando procesamiento...'
    });
    this.wsService.subscribeLote(this.loteId);

    this.http.post<any>(`${environment.apiUrl}/lotes/${this.loteId}/procesar?usuario=admin`, {}).subscribe();
  }

  irAResultados() {
    this.wsService.clear();
    this.router.navigate(['/admin/lotes', this.loteId, 'resultado']);
  }
}
