import { Component, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DatePipe, DecimalPipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { environment } from '@/environments/environment';

@Component({
  selector: 'dlp-lote-detalle',
  imports: [DatePipe, DecimalPipe, MatButtonModule, MatCardModule, MatIconModule, RouterLink],
  template: `
    <div class="mx-auto flex w-full max-w-7xl flex-auto flex-col gap-5 p-6 lg:p-8">
      <div class="flex items-end gap-4">
        <div>
          <div class="text-2xl font-semibold tracking-tight">Detalle del lote #{{ lote()?.id }}</div>
          <div class="mt-1 text-sm text-neutral-500">Periodo {{ lote()?.periodoAnio }}-{{ lote()?.periodoMes }} | Estado: {{ lote()?.estado }}</div>
        </div>
        <div class="flex-auto"></div>
        <a matButton="tonal" routerLink="/admin/dlp/lotes"><mat-icon svgIcon="arrow-left" />Volver</a>
        @if (lote()?.estado === 'VALIDADO') {
          <button matButton="filled" (click)="procesar()"><mat-icon svgIcon="play" />Procesar</button>
        }
      </div>

      <div class="grid gap-4 md:grid-cols-4">
        <mat-card appearance="filled"><mat-card-content><div class="text-sm text-neutral-500">Cargados</div><div class="text-2xl font-semibold">{{ lote()?.registrosCargados | number }}</div></mat-card-content></mat-card>
        <mat-card appearance="filled"><mat-card-content><div class="text-sm text-neutral-500">Procesados</div><div class="text-2xl font-semibold">{{ lote()?.registrosProcesados | number }}</div></mat-card-content></mat-card>
        <mat-card appearance="filled"><mat-card-content><div class="text-sm text-neutral-500">Usuario</div><div class="text-2xl font-semibold truncate">{{ lote()?.usuarioCarga }}</div></mat-card-content></mat-card>
        <mat-card appearance="filled"><mat-card-content><div class="text-sm text-neutral-500">Fecha</div><div class="text-2xl font-semibold">{{ lote()?.fechaCarga | date:'short' }}</div></mat-card-content></mat-card>
      </div>

      <mat-card appearance="filled">
        <mat-card-header><div class="font-medium">Registros (primeros 50)</div></mat-card-header>
        <mat-card-content class="overflow-auto p-0">
          <table class="w-full min-w-200 text-left text-xs">
            <thead class="text-neutral-500">
              <tr><th class="px-4 py-2">ID</th><th>Politica</th><th>Dominio</th><th>Destinatario</th><th>Usuario Alicorp</th><th>VP</th></tr>
            </thead>
            <tbody>
              @for (r of registros(); track r.id) {
                <tr class="border-t">
                  <td class="px-4 py-2">{{ r.id }}</td>
                  <td>{{ r.nombrePolitica }}</td>
                  <td class="font-medium">{{ r.dominioExt }}</td>
                  <td>{{ r.destinatarioExt }}</td>
                  <td>{{ r.correoUsuarioAlicorp }}</td>
                  <td>{{ r.vicepresidenciaUsuario }}</td>
                </tr>
              } @empty {
                <tr><td colspan="6" class="px-4 py-8 text-center text-neutral-400">Sin registros</td></tr>
              }
            </tbody>
          </table>
        </mat-card-content>
      </mat-card>
    </div>
  `,
})
export default class LoteDetallePage {
  private http = inject(HttpClient);
  private route = inject(ActivatedRoute);
  protected lote = signal<any>(null);
  protected registros = signal<any[]>([]);

  constructor() {
    const id = this.route.snapshot.params['id'];
    this.http.get<any>(`${environment.apiUrl}/lotes/${id}`).subscribe((res) => this.lote.set(res.data));
    this.http.get<any>(`${environment.apiUrl}/lotes/${id}/registros`).subscribe((res) => this.registros.set(res.data || []));
  }

  procesar() {
    const id = this.lote()?.id;
    if (!id) return;
    this.http.post<any>(`${environment.apiUrl}/lotes/${id}/procesar?usuario=admin`, {}).subscribe((res) => this.lote.set(res.data));
  }
}
