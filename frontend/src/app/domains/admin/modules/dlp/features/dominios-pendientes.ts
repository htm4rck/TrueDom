import { Component, inject, signal, computed } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatDialogModule, MatDialog, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DlpApiService, PendienteDominio } from '../services/dlp-api.service';
import { ValidacionDialogComponent } from './validacion-dialog';
import { HttpClient } from '@angular/common/http';
import { environment } from '@/environments/environment';

// ─── Detail Modal ───
@Component({
  selector: 'dlp-dominio-detalle-dialog',
  imports: [DecimalPipe, MatButtonModule, MatDialogModule, MatIconModule],
  template: `
    <h2 mat-dialog-title class="flex items-center gap-2"><mat-icon svgIcon="globe-lock" />Destinatarios de {{ data.dominio }}</h2>
    <mat-dialog-content>
      <div class="max-h-96 overflow-y-auto rounded-lg border border-neutral-200 dark:border-neutral-700">
        <table class="w-full text-xs">
          <thead class="sticky top-0 bg-neutral-100 dark:bg-neutral-800">
            <tr>
              <th class="px-3 py-2 text-left text-neutral-500">Destinatario</th>
              <th class="px-3 py-2 text-left text-neutral-500">Usuario Alicorp</th>
            </tr>
          </thead>
          <tbody>
            @for (d of data.asociados; track $index) {
              <tr class="border-t border-neutral-100 dark:border-neutral-700">
                <td class="px-3 py-2 font-medium">{{ d.destinatario }}</td>
                <td class="px-3 py-2 text-neutral-500">{{ d.usuarioAlicorp }}</td>
              </tr>
            } @empty {
              <tr><td colspan="2" class="px-3 py-6 text-center text-neutral-400">Sin destinatarios</td></tr>
            }
          </tbody>
        </table>
      </div>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button matButton mat-dialog-close>Cerrar</button>
    </mat-dialog-actions>
  `,
})
export class DominioDetalleDialogComponent {
  protected data = inject<any>(MAT_DIALOG_DATA);
}

// ─── Main Page ───
@Component({
  selector: 'dlp-dominios-pendientes',
  imports: [DatePipe, DecimalPipe, FormsModule, MatButtonModule, MatCardModule, MatIconModule, MatInputModule, MatDialogModule],
  template: `
    <div class="mx-auto flex w-full max-w-7xl flex-auto flex-col gap-6 p-6 lg:p-8">
      <!-- Header -->
      <div class="flex items-center gap-4">
        <div class="flex size-12 items-center justify-center rounded-xl bg-neutral-100 dark:bg-neutral-800">
          <mat-icon class="text-[#2D7FF9]" svgIcon="globe-lock" />
        </div>
        <div>
          <div class="text-2xl font-bold tracking-tight">Centro de Evaluación de Dominios</div>
          <div class="text-sm text-neutral-500">Clasificación y gobierno de dominios externos detectados</div>
        </div>
      </div>

      <!-- KPIs -->
      <div class="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <mat-card appearance="filled">
          <mat-card-content class="flex items-center justify-between py-4">
            <div>
              <div class="text-xs text-neutral-500">Dominios pendientes</div>
              <div class="text-3xl font-bold">{{ totalItems() | number }}</div>
            </div>
            <mat-icon class="size-6 text-[#2D7FF9]" svgIcon="globe" />
          </mat-card-content>
        </mat-card>
        <mat-card appearance="filled">
          <mat-card-content class="flex items-center justify-between py-4">
            <div>
              <div class="text-xs text-neutral-500">Usuarios afectados</div>
              <div class="text-3xl font-bold">{{ totalUsuarios() | number }}</div>
            </div>
            <mat-icon class="size-6 text-amber-500" svgIcon="users" />
          </mat-card-content>
        </mat-card>
        <mat-card appearance="filled">
          <mat-card-content class="flex items-center justify-between py-4">
            <div>
              <div class="text-xs text-neutral-500">Total registros</div>
              <div class="text-3xl font-bold">{{ totalRegistros() | number }}</div>
            </div>
            <mat-icon class="size-6 text-orange-500" svgIcon="database" />
          </mat-card-content>
        </mat-card>
        <mat-card appearance="filled">
          <mat-card-content class="flex items-center justify-between py-4">
            <div>
              <div class="text-xs text-neutral-500">Alto riesgo</div>
              <div class="text-3xl font-bold">{{ altoRiesgo() }}</div>
            </div>
            <mat-icon class="size-6 text-red-500" svgIcon="badge-alert" />
          </mat-card-content>
        </mat-card>
      </div>

      <!-- Search & Filters -->
      <mat-card appearance="filled">
        <mat-card-content class="flex items-center gap-3 py-2">
          <mat-form-field appearance="outline" class="flex-auto !text-sm">
            <mat-label>Buscar dominio...</mat-label>
            <input matInput [(ngModel)]="busqueda" (keyup.enter)="filtrar()" (input)="filtrar()" />
          </mat-form-field>
          @for (f of filtrosRiesgo; track f.value) {
            <button matButton="tonal" class="!text-xs" [class.!bg-[#052945]]="filtroRiesgo() === f.value" [class.!text-white]="filtroRiesgo() === f.value" (click)="setFiltro(f.value)">{{ f.label }}</button>
          }
        </mat-card-content>
      </mat-card>

      <!-- Table -->
      <div class="overflow-auto rounded-2xl border border-neutral-200 dark:border-neutral-700">
        <table class="w-full text-left text-sm">
          <thead class="bg-neutral-50 text-xs uppercase text-neutral-500 dark:bg-neutral-800/60">
            <tr>
              <th class="w-8 px-4 py-3"></th>
              <th class="px-4 py-3">Dominio</th>
              <th class="px-4 py-3">Riesgo</th>
              <th class="px-4 py-3">Usuarios</th>
              <th class="px-4 py-3">Registros</th>
              <th class="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            @for (item of paginatedItems(); track item.id) {
              <!-- Main row -->
              <tr class="border-t border-neutral-100 hover:bg-neutral-50/80 dark:border-neutral-800 dark:hover:bg-neutral-800/30 cursor-pointer"
                  (click)="toggleExpand(item.id)">
                <td class="px-4 py-4">
                  <mat-icon class="size-4 transition-transform" [class.rotate-90]="expanded() === item.id" svgIcon="chevron-right" />
                </td>
                <td class="px-4 py-4">
                  <div class="font-semibold text-base">{{ item.dominio }}</div>
                </td>
                <td class="px-4 py-4">
                  <span class="inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase" [class]="riesgoClass(item)">
                    {{ riesgoLabel(item) }}
                  </span>
                </td>
                <td class="px-4 py-4 font-medium">{{ item.totalUsuarios | number }}</td>
                <td class="px-4 py-4">
                  <div class="font-medium">{{ item.totalRegistros | number }}</div>
                  <div class="mt-1 h-1.5 w-20 overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-700">
                    <div class="h-full rounded-full bg-[#2D7FF9]" [style.width.%]="barWidth(item)"></div>
                  </div>
                </td>
                <td class="px-4 py-3" (click)="$event.stopPropagation()">
                  <div class="flex gap-2">
                    <button matButton="tonal" class="!text-xs !border-emerald-500/30 !bg-emerald-500/10 !text-emerald-600 dark:!text-emerald-400" (click)="validar(item, 'SEGURO')">
                      Confiable
                    </button>
                    <button matButton="tonal" class="!text-xs !border-red-500/30 !bg-red-500/10 !text-red-600 dark:!text-red-400" (click)="validar(item, 'NO_SEGURO')">
                      Restringir
                    </button>
                  </div>
                </td>
              </tr>

              <!-- Expanded panel — strategic view -->
              @if (expanded() === item.id) {
                <tr class="bg-neutral-50/50 dark:bg-neutral-900/30">
                  <td colspan="6" class="px-6 py-5">
                    <div class="grid gap-5 lg:grid-cols-2">
                      <!-- Left: Risk summary + Timeline -->
                      <div class="space-y-4">
                        <div class="rounded-xl border border-neutral-200 bg-white p-5 dark:border-neutral-700 dark:bg-neutral-800/50">
                          <div class="mb-3 text-xs font-semibold uppercase tracking-wider text-neutral-400">Resumen de Riesgo</div>
                          <div class="space-y-2.5 text-sm">
                            <div class="flex justify-between">
                              <span class="text-neutral-500">Clasificación</span>
                              <span class="font-medium">Pendiente de revisión</span>
                            </div>
                            <div class="flex justify-between">
                              <span class="text-neutral-500">Usuarios impactados</span>
                              <span class="font-medium">{{ item.totalUsuarios | number }}</span>
                            </div>
                            <div class="flex justify-between">
                              <span class="text-neutral-500">Incidentes asociados</span>
                              <span class="font-medium">{{ item.totalRegistros | number }}</span>
                            </div>
                            <div class="flex justify-between">
                              <span class="text-neutral-500">VP afectadas</span>
                              <span class="font-medium">{{ item.totalVp || '—' }}</span>
                            </div>
                          </div>
                        </div>

                        <!-- Timeline -->
                        <div class="rounded-xl border border-neutral-200 bg-white p-5 dark:border-neutral-700 dark:bg-neutral-800/50">
                          <div class="mb-3 text-xs font-semibold uppercase tracking-wider text-neutral-400">Actividad</div>
                          <div class="space-y-3">
                            <div class="flex items-start gap-2.5">
                              <div class="mt-1.5 size-2 rounded-full bg-[#2D7FF9]"></div>
                              <div><div class="text-sm">Detectado en carga</div><div class="text-[10px] text-neutral-400">{{ item.ultimaActividad | date:'medium' }}</div></div>
                            </div>
                            <div class="flex items-start gap-2.5">
                              <div class="mt-1.5 size-2 rounded-full bg-[#2D7FF9]"></div>
                              <div><div class="text-sm">Clasificado automáticamente</div><div class="text-[10px] text-neutral-400">Procesamiento del lote</div></div>
                            </div>
                            <div class="flex items-start gap-2.5">
                              <div class="mt-1.5 size-2 rounded-full bg-amber-400"></div>
                              <div><div class="text-sm font-medium">Pendiente de decisión</div><div class="text-[10px] text-neutral-400">Esperando revisión</div></div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <!-- Right: Recommendation + Impact -->
                      <div class="space-y-4">
                        <div class="rounded-xl border border-neutral-200 bg-white p-5 dark:border-neutral-700 dark:bg-neutral-800/50">
                          <div class="mb-3 text-xs font-semibold uppercase tracking-wider text-neutral-400">Recomendación del Sistema</div>
                          <div class="flex items-center gap-3 mb-3">
                            <mat-icon class="size-8 text-[#2D7FF9]" svgIcon="chart-column" />
                            <div>
                              <div class="font-semibold">{{ recomendacion(item) }}</div>
                              <div class="text-xs text-neutral-500">Confianza: {{ confianza(item) }}%</div>
                            </div>
                          </div>
                          <div class="space-y-1.5 text-xs text-neutral-600 dark:text-neutral-400">
                            @if (item.totalUsuarios > 100) { <div>✔ Dominio de uso frecuente</div> }
                            @if (item.totalRegistros > 500) { <div>✔ Alto volumen de comunicación</div> }
                            @if ((item.totalVp || 0) > 2) { <div>✔ Múltiples VP involucradas</div> }
                            <div>✔ Sin incidentes previos conocidos</div>
                          </div>
                        </div>

                        <!-- Impacto organizacional -->
                        <div class="rounded-xl border border-neutral-200 bg-white p-5 dark:border-neutral-700 dark:bg-neutral-800/50">
                          <div class="mb-3 text-xs font-semibold uppercase tracking-wider text-neutral-400">Impacto Organizacional</div>
                          @if (item.vicepresidencias) {
                            <div class="text-xs text-neutral-500 mb-2">Vicepresidencias afectadas</div>
                            <div class="flex flex-wrap gap-1.5 mb-3">
                              @for (vp of getVps(item); track vp) {
                                <span class="rounded-full bg-neutral-100 px-2.5 py-0.5 text-[10px] font-medium dark:bg-neutral-700">{{ vp }}</span>
                              }
                            </div>
                          }
                          @if (item.politicas) {
                            <div class="text-xs text-neutral-500 mb-2">Políticas DLP activadas</div>
                            <div class="flex flex-wrap gap-1.5">
                              @for (pol of getPoliticas(item); track pol) {
                                <span class="rounded-full bg-blue-50 px-2.5 py-0.5 text-[10px] font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">{{ pol }}</span>
                              }
                            </div>
                          }
                        </div>

                        <!-- Actions -->
                        <div class="flex gap-2">
                          <button matButton="filled" class="!bg-emerald-600 flex-1" (click)="validar(item, 'SEGURO')">
                            <mat-icon svgIcon="shield-check" />Confiable
                          </button>
                          <button matButton="filled" class="!bg-red-600 flex-1" (click)="validar(item, 'NO_SEGURO')">
                            <mat-icon svgIcon="shield-x" />Restringir
                          </button>
                          <button matButton="tonal" (click)="verDetalle(item)">
                            <mat-icon svgIcon="file-text" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </td>
                </tr>
              }
            } @empty {
              <tr><td colspan="6" class="px-4 py-16 text-center text-neutral-400">Sin dominios pendientes de validación</td></tr>
            }
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      @if (totalPages() > 1) {
        <div class="flex items-center justify-center gap-3">
          <button matButton="tonal" [disabled]="page() === 0" (click)="page.set(page() - 1)">Anterior</button>
          <span class="text-sm text-neutral-500">{{ page() + 1 }} / {{ totalPages() }}</span>
          <button matButton="tonal" [disabled]="page() >= totalPages() - 1" (click)="page.set(page() + 1)">Siguiente</button>
        </div>
      }
    </div>
  `,
})
export default class DominiosPendientesPage {
  private api = inject(DlpApiService);
  private dialog = inject(MatDialog);
  private allItems = signal<PendienteDominio[]>([]);
  protected page = signal(0);
  protected expanded = signal<number | null>(null);
  protected busqueda = '';
  protected filtroRiesgo = signal('');
  protected filtrosRiesgo = [
    { value: '', label: 'Todos' },
    { value: 'CRITICO', label: 'Crítico' },
    { value: 'ALTO', label: 'Alto' },
    { value: 'MEDIO', label: 'Medio' },
    { value: 'BAJO', label: 'Bajo' },
  ];
  private pageSize = 15;

  protected totalItems = computed(() => this.filteredItems().length);
  protected totalUsuarios = computed(() => this.allItems().reduce((sum, i) => sum + i.totalUsuarios, 0));
  protected totalRegistros = computed(() => this.allItems().reduce((sum, i) => sum + i.totalRegistros, 0));
  protected altoRiesgo = computed(() => this.allItems().filter(i => i.totalRegistros > 500).length);
  protected totalPages = computed(() => Math.max(1, Math.ceil(this.filteredItems().length / this.pageSize)));

  private filteredItems = computed(() => {
    let items = this.allItems();
    const riesgo = this.filtroRiesgo();
    if (riesgo) {
      items = items.filter(i => this.riesgoLabel(i) === riesgo.toUpperCase());
    }
    if (this.busqueda) {
      items = items.filter(i => i.dominio.toLowerCase().includes(this.busqueda.toLowerCase()));
    }
    return items;
  });

  protected paginatedItems = computed(() => {
    const start = this.page() * this.pageSize;
    return this.filteredItems().slice(start, start + this.pageSize);
  });

  constructor() {
    this.cargar();
  }

  private cargar() {
    this.api.getDominiosPendientes().subscribe((data) => this.allItems.set(data));
  }

  filtrar() { this.page.set(0); }

  setFiltro(valor: string) {
    this.filtroRiesgo.set(this.filtroRiesgo() === valor ? '' : valor);
    this.page.set(0);
  }

  toggleExpand(id: number) {
    this.expanded.set(this.expanded() === id ? null : id);
  }

  verDetalle(item: PendienteDominio) {
    this.api.getDetallePendienteDominio(item.id).subscribe((data: any) => {
      this.dialog.open(DominioDetalleDialogComponent, {
        data: { dominio: item.dominio, asociados: data.asociados || [] },
        width: '600px',
      });
    });
  }

  validar(item: PendienteDominio, decision: string) {
    const ref = this.dialog.open(ValidacionDialogComponent, {
      data: { titulo: `Marcar "${item.dominio}" como ${decision === 'SEGURO' ? 'CONFIABLE' : 'RESTRINGIDO'}`, decision },
      width: '420px',
    });
    ref.afterClosed().subscribe((result) => {
      if (result) {
        this.api.validarDominio(item.id, decision, result.justificacion, result.usuario).subscribe(() => {
          this.expanded.set(null);
          this.cargar();
        });
      }
    });
  }

  riesgoClass(item: PendienteDominio): string {
    if (item.totalRegistros > 1000) return 'border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-400';
    if (item.totalRegistros > 500) return 'border-orange-500/30 bg-orange-500/10 text-orange-600 dark:text-orange-400';
    if (item.totalRegistros > 100) return 'border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400';
    return 'border-sky-500/30 bg-sky-500/10 text-sky-600 dark:text-sky-400';
  }

  riesgoLabel(item: PendienteDominio): string {
    if (item.totalRegistros > 1000) return 'CRÍTICO';
    if (item.totalRegistros > 500) return 'ALTO';
    if (item.totalRegistros > 100) return 'MEDIO';
    return 'BAJO';
  }

  recomendacion(item: PendienteDominio): string {
    if (item.totalUsuarios > 50 && item.totalRegistros > 200) return 'Probablemente confiable';
    if (item.totalRegistros > 500) return 'Requiere revisión detallada';
    return 'Evaluar con precaución';
  }

  confianza(item: PendienteDominio): number {
    let score = 50;
    if (item.totalUsuarios > 100) score += 20;
    if (item.totalRegistros > 500) score += 10;
    if ((item.totalVp || 0) > 2) score += 10;
    return Math.min(95, score);
  }

  getVps(item: PendienteDominio): string[] {
    return item.vicepresidencias ? item.vicepresidencias.split(',').filter(v => v.trim()).slice(0, 6) : [];
  }

  getPoliticas(item: PendienteDominio): string[] {
    return item.politicas ? item.politicas.split(',').filter(p => p.trim()) : [];
  }

  barWidth(item: PendienteDominio): number {
    const max = Math.max(...this.allItems().map(i => i.totalRegistros), 1);
    return Math.round((item.totalRegistros / max) * 100);
  }
}
