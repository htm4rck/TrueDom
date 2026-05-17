import { Component, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DatePipe, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { Router, RouterLink } from '@angular/router';
import { environment } from '@/environments/environment';
import { WebSocketService, ProgresoLote } from '../services/websocket.service';

// ─── Upload Dialog ───
@Component({
  selector: 'dlp-upload-dialog',
  imports: [FormsModule, MatButtonModule, MatDialogModule, MatIconModule, MatInputModule, MatSelectModule, MatProgressBarModule],
  template: `
    <h2 mat-dialog-title class="flex items-center gap-2"><mat-icon svgIcon="cloud-upload" />Cargar lote DLP</h2>
    <mat-dialog-content class="flex flex-col gap-4">
      <div class="flex min-h-32 flex-col items-center justify-center rounded-lg border-2 border-dashed p-4 text-center"
           [class.border-[#2D7FF9]]="archivo()" [class.border-neutral-300]="!archivo()"
           (dragover)="$event.preventDefault()" (drop)="onDrop($event)">
        @if (archivo()) {
          <div class="font-semibold">{{ archivo()!.name }}</div>
          <div class="text-xs text-neutral-500">{{ (archivo()!.size / 1024 / 1024).toFixed(1) }} MB</div>
          <button class="mt-2 text-xs underline" (click)="archivo.set(null)">Cambiar</button>
        } @else {
          <div class="text-sm text-neutral-500">Arrastra el archivo XLSX o</div>
          <button class="mt-1" matButton="tonal" (click)="fileInput.click()">Seleccionar archivo</button>
          <input #fileInput type="file" accept=".csv,.xlsx,.xls" class="hidden" (change)="onFileSelect($event)" />
        }
      </div>
      <div class="grid grid-cols-2 gap-3">
        <mat-form-field appearance="outline">
          <mat-label>Mes</mat-label>
          <mat-select [(value)]="mes">
            @for (m of meses; track m.value) { <mat-option [value]="m.value">{{ m.label }}</mat-option> }
          </mat-select>
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Año</mat-label>
          <input matInput type="number" [(ngModel)]="anio" />
        </mat-form-field>
      </div>
      <mat-form-field appearance="outline">
        <mat-label>Usuario</mat-label>
        <input matInput [(ngModel)]="usuario" />
      </mat-form-field>
      @if (error()) {
        <div class="rounded-md bg-red-50 p-2 text-xs text-red-800">{{ error() }}</div>
      }
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button matButton mat-dialog-close>Cancelar</button>
      <button matButton="filled" [disabled]="!archivo() || subiendo()" (click)="cargar()">
        <mat-icon svgIcon="cloud-upload" />Iniciar carga
      </button>
    </mat-dialog-actions>
  `,
})
export class UploadDialogComponent {
  private http = inject(HttpClient);
  private dialogRef = inject(MatDialogRef<UploadDialogComponent>);

  protected archivo = signal<File | null>(null);
  protected subiendo = signal(false);
  protected error = signal<string | null>(null);
  protected mes = String(new Date().getMonth() + 1);
  protected anio = new Date().getFullYear();
  protected usuario = 'admin.dlp@alicorp.com.pe';
  protected meses = [
    { value: '1', label: 'Ene' }, { value: '2', label: 'Feb' }, { value: '3', label: 'Mar' },
    { value: '4', label: 'Abr' }, { value: '5', label: 'May' }, { value: '6', label: 'Jun' },
    { value: '7', label: 'Jul' }, { value: '8', label: 'Ago' }, { value: '9', label: 'Sep' },
    { value: '10', label: 'Oct' }, { value: '11', label: 'Nov' }, { value: '12', label: 'Dic' },
  ];

  onFileSelect(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) this.archivo.set(input.files[0]);
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    if (event.dataTransfer?.files.length) this.archivo.set(event.dataTransfer.files[0]);
  }

  cargar() {
    const file = this.archivo();
    if (!file) return;
    this.subiendo.set(true);
    this.error.set(null);

    const form = new FormData();
    form.append('archivo', file);
    form.append('anio', String(this.anio));
    form.append('mes', this.mes);
    form.append('usuario', this.usuario);

    this.http.post<any>(`${environment.apiUrl}/lotes`, form).subscribe({
      next: (res) => this.dialogRef.close(res.data),
      error: (err) => {
        this.error.set(err.error?.error || 'Error al iniciar la carga');
        this.subiendo.set(false);
      },
    });
  }
}

// ─── Main Page ───
@Component({
  selector: 'dlp-lotes',
  imports: [DatePipe, DecimalPipe, MatButtonModule, MatCardModule, MatIconModule, MatDialogModule, MatProgressBarModule, RouterLink],
  template: `
    <div class="mx-auto flex w-full max-w-7xl flex-auto flex-col gap-5 p-6 lg:p-8">
      <div class="flex items-end gap-4">
        <div>
          <div class="text-2xl font-semibold tracking-tight">Lotes DLP</div>
          <div class="mt-1 text-sm text-neutral-500">Carga, procesamiento y seguimiento de lotes mensuales.</div>
        </div>
        <div class="flex-auto"></div>
        <button matButton="filled" (click)="abrirCarga()"><mat-icon svgIcon="plus" />Nuevo lote</button>
      </div>

      <!-- Filters -->
      <div class="flex gap-2 flex-wrap">
        @for (f of filtros; track f.value) {
          <button matButton="tonal" class="!text-xs" [class.!bg-[#052945]]="filtroEstado() === f.value" [class.!text-white]="filtroEstado() === f.value" (click)="filtroEstado.set(f.value); cargar()">{{ f.label }}</button>
        }
      </div>

      <!-- Table -->
      <div class="overflow-auto rounded-lg border border-neutral-200 dark:border-neutral-700">
        <table class="w-full text-left text-sm">
          <thead class="bg-neutral-50 text-xs uppercase text-neutral-500 dark:bg-neutral-800/60">
            <tr>
              <th class="px-4 py-3 w-8"></th>
              <th class="px-4 py-3">Lote</th>
              <th class="px-4 py-3">Periodo</th>
              <th class="px-4 py-3">Estado</th>
              <th class="px-4 py-3">Cargados</th>
              <th class="px-4 py-3">Procesados</th>
              <th class="px-4 py-3">Responsable</th>
              <th class="px-4 py-3">Fecha</th>
              <th class="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            @for (lote of lotes(); track lote.id) {
              <!-- Main row -->
              <tr class="border-t border-neutral-100 hover:bg-neutral-50/80 dark:border-neutral-800 dark:hover:bg-neutral-800/30 cursor-pointer"
                  (click)="toggleExpand(lote.id)">
                <td class="px-4 py-3">
                  <mat-icon class="size-4 transition-transform" [class.rotate-90]="expanded() === lote.id" svgIcon="chevron-right" />
                </td>
                <td class="px-4 py-3 font-semibold">#{{ lote.id }}</td>
                <td class="px-4 py-3">{{ lote.periodoAnio }}-{{ lote.periodoMes | number:'2.0-0' }}</td>
                <td class="px-4 py-3">
                  <span class="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase" [class]="estadoClass(lote.estado)">{{ lote.estado }}</span>
                </td>
                <td class="px-4 py-3">{{ lote.registrosCargados | number }}</td>
                <td class="px-4 py-3">{{ lote.registrosProcesados | number }}</td>
                <td class="px-4 py-3 text-neutral-500">{{ lote.usuarioCarga }}</td>
                <td class="px-4 py-3 text-neutral-500">{{ lote.fechaCarga | date:'short' }}</td>
                <td class="px-4 py-2" (click)="$event.stopPropagation()">
                  @if (lote.estado === 'VALIDADO') {
                    <button matButton="filled" class="!text-xs" (click)="procesar(lote)"><mat-icon svgIcon="play" />Procesar</button>
                  }
                  @if (lote.estado === 'CON_OBSERVACIONES' || lote.estado === 'PROCESADO') {
                    <a matButton="tonal" class="!text-xs" [routerLink]="['/admin/lotes', lote.id, 'resultado']"><mat-icon svgIcon="chart-column" />Resultados</a>
                  }
                </td>
              </tr>

              <!-- Expanded detail row -->
              @if (expanded() === lote.id) {
                <tr class="bg-neutral-50/70 dark:bg-neutral-800/20">
                  <td colspan="9" class="px-6 py-4">
                    <!-- Progress (carga or procesamiento) -->
                    @if (progreso(); as p) {
                      @if (p.loteId === lote.id && p.fase !== 'COMPLETADO' && p.fase !== 'ERROR') {
                        <div class="flex flex-col items-center gap-3 py-4">
                          <mat-icon class="size-8 text-[#2D7FF9] animate-pulse" svgIcon="loader" />
                          <div class="w-full max-w-md">
                            <mat-progress-bar mode="buffer" [value]="p.porcentaje" [bufferValue]="p.porcentaje + 5" />
                          </div>
                          <div class="text-2xl font-black">{{ p.porcentaje }}%</div>
                          <div class="text-xs text-neutral-500">{{ p.mensaje }}</div>
                          <div class="flex gap-6 text-xs text-center">
                            <div><div class="text-lg font-bold">{{ p.registrosLeidos | number }}</div>Registros</div>
                            <div><div class="text-lg font-bold">{{ p.dominiosEncontrados }}</div>Dominios</div>
                            <div><div class="text-lg font-bold">{{ p.destinatariosEncontrados }}</div>Destinatarios</div>
                          </div>
                        </div>
                      } @else if (p.loteId === lote.id && p.fase === 'COMPLETADO') {
                        <div class="flex flex-col items-center gap-2 py-4">
                          <mat-icon class="size-8 text-[#3f9829]" svgIcon="circle-check" />
                          <div class="font-semibold text-[#3f9829]">Completado — {{ p.registrosLeidos | number }} registros</div>
                          <div class="flex gap-2 mt-2">
                            @if (lote.estado === 'CON_OBSERVACIONES' || lote.estado === 'PROCESADO') {
                              <a matButton="filled" [routerLink]="['/admin/lotes', lote.id, 'resultado']" (click)="wsService.clear()">
                                <mat-icon svgIcon="chart-column" />Ver resultados
                              </a>
                            } @else {
                              <button matButton="filled" (click)="wsService.clear(); cargar()">
                                <mat-icon svgIcon="play" />Procesar lote
                              </button>
                            }
                            <button matButton="tonal" (click)="wsService.clear(); cargar()">Cerrar</button>
                          </div>
                        </div>
                      } @else if (p.loteId === lote.id && p.fase === 'ERROR') {
                        <div class="flex flex-col items-center gap-2 py-4">
                          <mat-icon class="size-8 text-red-600" svgIcon="circle-x" />
                          <div class="font-semibold text-red-600">Error: {{ p.mensaje }}</div>
                          <button matButton="tonal" (click)="wsService.clear()">Cerrar</button>
                        </div>
                      }
                    }

                    <!-- Detail sections when no progress -->
                    @if (!progreso() || progreso()!.loteId !== lote.id) {
                      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        <div class="space-y-2">
                          <div class="text-xs font-semibold uppercase text-neutral-400">Información</div>
                          <div class="text-xs"><span class="text-neutral-500">Periodo:</span> {{ lote.periodoAnio }}-{{ lote.periodoMes | number:'2.0-0' }}</div>
                          <div class="text-xs"><span class="text-neutral-500">Responsable:</span> {{ lote.usuarioCarga }}</div>
                          <div class="text-xs"><span class="text-neutral-500">Fecha carga:</span> {{ lote.fechaCarga | date:'medium' }}</div>
                        </div>
                        <div class="space-y-2">
                          <div class="text-xs font-semibold uppercase text-neutral-400">Métricas</div>
                          <div class="text-xs"><span class="text-neutral-500">Registros cargados:</span> {{ lote.registrosCargados | number }}</div>
                          <div class="text-xs"><span class="text-neutral-500">Registros procesados:</span> {{ lote.registrosProcesados | number }}</div>
                          <div class="text-xs"><span class="text-neutral-500">Estado:</span> {{ lote.estado }}</div>
                        </div>
                        <div class="space-y-2">
                          <div class="text-xs font-semibold uppercase text-neutral-400">Acciones</div>
                          <div class="flex flex-wrap gap-2">
                            <a matButton="tonal" class="!text-xs" [routerLink]="['/admin/lotes', lote.id]"><mat-icon svgIcon="file-text" />Registros</a>
                            @if (lote.estado === 'CON_OBSERVACIONES' || lote.estado === 'PROCESADO') {
                              <a matButton="filled" class="!text-xs" [routerLink]="['/admin/lotes', lote.id, 'resultado']"><mat-icon svgIcon="chart-column" />Resultados</a>
                              <a matButton="tonal" class="!text-xs" routerLink="/admin/dominios-pendientes"><mat-icon svgIcon="globe-lock" />Dominios</a>
                            }
                          </div>
                        </div>
                      </div>
                    }
                  </td>
                </tr>
              }
            } @empty {
              <tr><td colspan="9" class="px-4 py-12 text-center text-neutral-400">Sin lotes cargados</td></tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `,
})
export default class LotesPage {
  private http = inject(HttpClient);
  private dialog = inject(MatDialog);
  private router = inject(Router);
  protected wsService = inject(WebSocketService);

  protected lotes = signal<any[]>([]);
  protected expanded = signal<number | null>(null);
  protected progreso = this.wsService.progreso;
  protected filtroEstado = signal('');
  protected filtros = [
    { value: '', label: 'Todos' },
    { value: 'CARGANDO', label: 'Cargando' },
    { value: 'VALIDADO', label: 'Validado' },
    { value: 'PROCESANDO', label: 'Procesando' },
    { value: 'CON_OBSERVACIONES', label: 'Con observaciones' },
    { value: 'PROCESADO', label: 'Procesado' },
    { value: 'ERROR', label: 'Error' },
  ];

  constructor() {
    this.cargar();
    this.reconectarSiProcesando();
  }

  private reconectarSiProcesando() {
    // If any lote is in PROCESANDO/CARGANDO state, reconnect WebSocket
    this.http.get<any>(`${environment.apiUrl}/lotes`).subscribe((res) => {
      const lotes = res.data || [];
      const activo = lotes.find((l: any) => l.estado === 'PROCESANDO' || l.estado === 'CARGANDO');
      if (activo && !this.wsService.isActive) {
        this.expanded.set(activo.id);
        this.wsService.progreso.set({
          loteId: activo.id, fase: activo.estado === 'CARGANDO' ? 'CARGANDO' : 'PROCESANDO',
          registrosLeidos: 0, totalEstimado: 0, porcentaje: 0,
          dominiosEncontrados: 0, destinatariosEncontrados: 0,
          mensaje: 'Reconectando...'
        });
        this.wsService.subscribeLote(activo.id);
        this.watchCompletion();
      }
    });
  }

  cargar() {
    this.http.get<any>(`${environment.apiUrl}/lotes`).subscribe((res) => {
      let data = res.data || [];
      const filtro = this.filtroEstado();
      if (filtro) data = data.filter((l: any) => l.estado === filtro);
      this.lotes.set(data);
    });
  }

  toggleExpand(id: number) {
    this.expanded.set(this.expanded() === id ? null : id);
  }

  abrirCarga() {
    const ref = this.dialog.open(UploadDialogComponent, { width: '480px' });
    ref.afterClosed().subscribe((lote) => {
      if (lote) {
        this.cargar();
        this.expanded.set(lote.id);
        this.wsService.progreso.set({
          loteId: lote.id, fase: 'INICIANDO', registrosLeidos: 0,
          totalEstimado: 0, porcentaje: 0, dominiosEncontrados: 0,
          destinatariosEncontrados: 0, mensaje: 'Conectando...'
        });
        this.wsService.subscribeLote(lote.id);
        this.watchCompletion();
      }
    });
  }

  procesar(lote: any) {
    this.expanded.set(lote.id);
    this.wsService.progreso.set({
      loteId: lote.id, fase: 'INICIANDO', registrosLeidos: 0,
      totalEstimado: 0, porcentaje: 0, dominiosEncontrados: 0,
      destinatariosEncontrados: 0, mensaje: 'Iniciando procesamiento...'
    });
    this.wsService.subscribeLote(lote.id);
    this.http.post<any>(`${environment.apiUrl}/lotes/${lote.id}/procesar?usuario=admin`, {}).subscribe();
    this.watchCompletion();
  }

  private completionInterval: any = null;
  private watchCompletion() {
    if (this.completionInterval) return;
    this.completionInterval = setInterval(() => {
      const p = this.wsService.progreso();
      if (p && (p.fase === 'COMPLETADO' || p.fase === 'ERROR')) {
        this.cargar();
        clearInterval(this.completionInterval);
        this.completionInterval = null;
      }
    }, 1000);
  }

  estadoClass(estado: string): string {
    switch (estado) {
      case 'PROCESADO': case 'CERRADO': return 'bg-emerald-100 text-emerald-800';
      case 'PROCESANDO': case 'CARGANDO': return 'bg-blue-100 text-blue-800';
      case 'CON_OBSERVACIONES': return 'bg-amber-100 text-amber-800';
      case 'ERROR': return 'bg-red-100 text-red-800';
      default: return 'bg-neutral-100 text-neutral-800';
    }
  }
}
