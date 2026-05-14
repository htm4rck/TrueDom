import { Component, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DatePipe, DecimalPipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { Router, RouterLink } from '@angular/router';
import { environment } from '@/environments/environment';

@Component({
  selector: 'dlp-procesar-dialog',
  imports: [MatButtonModule, MatDialogModule, MatIconModule, MatProgressBarModule],
  template: `
    <h2 mat-dialog-title class="flex items-center gap-2"><mat-icon svgIcon="database-zap" />Procesar lote #{{ data.lote.id }}</h2>
    <mat-dialog-content>
      @if (!procesando() && !resultado()) {
        <p class="text-sm text-neutral-600 mb-4">El procesamiento ejecutará las siguientes validaciones:</p>
        <ol class="text-sm space-y-2 list-decimal list-inside text-neutral-700">
          <li><strong>Dominios:</strong> Cada dominio externo se valida contra la lista blanca y negra. Los no clasificados se envían a la bandeja de pendientes del administrador.</li>
          <li><strong>Destinatarios:</strong> Para dominios seguros, cada destinatario se valida contra catálogos. Los no clasificados se asignan al usuario Alicorp responsable.</li>
        </ol>
        <div class="mt-4 rounded-md bg-neutral-100 p-3 text-xs text-neutral-500">
          Registros a procesar: <strong>{{ data.lote.registrosCargados }}</strong>
        </div>
      }
      @if (procesando()) {
        <div class="py-6 text-center">
          <mat-progress-bar mode="indeterminate" />
          <p class="mt-3 text-sm text-neutral-500">Procesando dominios y destinatarios...</p>
        </div>
      }
      @if (resultado()) {
        <div class="py-4 space-y-3">
          <div class="flex items-center gap-2 text-[#3f9829]"><mat-icon svgIcon="circle-check" /><span class="font-medium">Procesamiento completado</span></div>
          <div class="rounded-md bg-neutral-50 p-3 text-sm space-y-1">
            <div>Estado: <strong>{{ resultado().estado }}</strong></div>
            <div>Registros procesados: <strong>{{ resultado().registrosProcesados }}</strong></div>
          </div>
          <p class="text-xs text-neutral-500">Revisa los dominios y destinatarios encontrados en la pantalla de resultados.</p>
        </div>
      }
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      @if (!procesando() && !resultado()) {
        <button matButton mat-dialog-close>Cancelar</button>
        <button matButton="filled" (click)="ejecutar()"><mat-icon svgIcon="play" />Iniciar procesamiento</button>
      }
      @if (resultado()) {
        <button matButton="filled" [mat-dialog-close]="resultado()">Ver resultados</button>
      }
    </mat-dialog-actions>
  `,
})
export class ProcesarDialogComponent {
  protected data = inject<{ lote: any }>(MAT_DIALOG_DATA);
  private http = inject(HttpClient);
  private dialogRef = inject(MatDialogRef<ProcesarDialogComponent>);
  protected procesando = signal(false);
  protected resultado = signal<any>(null);

  ejecutar() {
    this.procesando.set(true);
    this.http.post<any>(`${environment.apiUrl}/lotes/${this.data.lote.id}/procesar?usuario=admin`, {}).subscribe({
      next: (res) => { this.procesando.set(false); this.resultado.set(res.data); },
      error: () => { this.procesando.set(false); this.dialogRef.close(); },
    });
  }
}

@Component({
  selector: 'dlp-lotes',
  imports: [DatePipe, DecimalPipe, MatButtonModule, MatCardModule, MatIconModule, MatDialogModule, RouterLink],
  template: `
    <div class="mx-auto flex w-full max-w-7xl flex-auto flex-col gap-5 p-6 lg:p-8">
      <div class="flex items-end gap-4">
        <div>
          <div class="text-2xl font-semibold tracking-tight">Procesamiento</div>
          <div class="mt-1 text-sm text-neutral-500">Lotes DLP cargados, procesamiento y seguimiento de pendientes.</div>
        </div>
        <div class="flex-auto"></div>
        <a matButton="filled" routerLink="/admin/carga-lote"><mat-icon svgIcon="plus" />Nuevo lote</a>
      </div>

      @for (lote of lotes(); track lote.id) {
        <mat-card appearance="filled">
          <mat-card-content class="p-0">
            <!-- Row principal -->
            <div class="flex items-center gap-4 px-5 py-4 cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-800/50" (click)="toggleExpand(lote.id)">
              <mat-icon class="size-4 transition-transform" [class.rotate-90]="expanded() === lote.id" svgIcon="chevron-right" />
              <div class="min-w-0 flex-auto">
                <div class="flex items-center gap-3">
                  <span class="font-semibold">Lote #{{ lote.id }}</span>
                  <span class="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase" [class]="estadoClass(lote.estado)">{{ lote.estado }}</span>
                  <span class="text-xs text-neutral-500">{{ lote.periodoAnio }}-{{ lote.periodoMes | number:'2.0-0' }}</span>
                </div>
                <div class="mt-0.5 text-xs text-neutral-500">
                  {{ lote.registrosCargados | number }} cargados · {{ lote.registrosProcesados | number }} procesados · {{ lote.usuarioCarga }} · {{ lote.fechaCarga | date:'medium' }}
                </div>
              </div>
              <div class="flex gap-2">
                @if (lote.estado === 'VALIDADO') {
                  <button matButton="filled" (click)="procesar(lote, $event)"><mat-icon svgIcon="play" />Procesar</button>
                }
                @if (lote.estado === 'CON_OBSERVACIONES') {
                  <a matButton="tonal" routerLink="/admin/dominios-pendientes" (click)="$event.stopPropagation()">
                    <mat-icon svgIcon="globe-lock" />Dominios
                  </a>
                  <a matButton="tonal" routerLink="/admin/destinatarios-pendientes" (click)="$event.stopPropagation()">
                    <mat-icon svgIcon="mail-question-mark" />Destinatarios
                  </a>
                }
              </div>
            </div>

            <!-- Accordion expandido -->
            @if (expanded() === lote.id) {
              <div class="border-t px-5 py-4 bg-neutral-50/50 dark:bg-neutral-800/30">
                <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 text-sm">
                  <div><span class="text-neutral-500">Periodo:</span> {{ lote.periodoAnio }}-{{ lote.periodoMes | number:'2.0-0' }}</div>
                  <div><span class="text-neutral-500">Registros cargados:</span> {{ lote.registrosCargados | number }}</div>
                  <div><span class="text-neutral-500">Registros procesados:</span> {{ lote.registrosProcesados | number }}</div>
                  <div><span class="text-neutral-500">Responsable:</span> {{ lote.usuarioCarga }}</div>
                  <div><span class="text-neutral-500">Fecha carga:</span> {{ lote.fechaCarga | date:'medium' }}</div>
                  <div><span class="text-neutral-500">Estado:</span> {{ lote.estado }}</div>
                </div>
                <div class="mt-3 flex gap-2">
                  <a matButton="tonal" [routerLink]="'/admin/lotes/' + lote.id + '/resultado'" (click)="$event.stopPropagation()">
                    <mat-icon svgIcon="chart-column" />Ver resultados
                  </a>
                  <a matButton="tonal" [routerLink]="'/admin/lotes/' + lote.id" (click)="$event.stopPropagation()">
                    <mat-icon svgIcon="file-text" />Ver registros
                  </a>
                </div>
              </div>
            }
          </mat-card-content>
        </mat-card>
      } @empty {
        <mat-card appearance="filled">
          <mat-card-content class="py-12 text-center text-neutral-400">
            Sin lotes cargados. <a class="underline" routerLink="/admin/carga-lote">Cargar primer lote</a>
          </mat-card-content>
        </mat-card>
      }
    </div>
  `,
})
export default class LotesPage {
  private http = inject(HttpClient);
  private dialog = inject(MatDialog);
  private router = inject(Router);
  protected lotes = signal<any[]>([]);
  protected expanded = signal<number | null>(null);

  constructor() {
    this.cargar();
  }

  private cargar() {
    this.http.get<any>(`${environment.apiUrl}/lotes`).subscribe((res) => this.lotes.set(res.data || []));
  }

  toggleExpand(id: number) {
    this.expanded.set(this.expanded() === id ? null : id);
  }

  procesar(lote: any, event: Event) {
    event.stopPropagation();
    const ref = this.dialog.open(ProcesarDialogComponent, { data: { lote }, width: '500px' });
    ref.afterClosed().subscribe((result) => {
      if (result) {
        this.cargar();
        this.router.navigate(['/admin/lotes', lote.id, 'resultado']);
      }
    });
  }

  estadoClass(estado: string): string {
    switch (estado) {
      case 'PROCESADO': case 'CERRADO': return 'bg-emerald-100 text-emerald-800';
      case 'PROCESANDO': return 'bg-blue-100 text-blue-800';
      case 'CON_OBSERVACIONES': return 'bg-amber-100 text-amber-800';
      case 'ERROR': return 'bg-red-100 text-red-800';
      default: return 'bg-neutral-100 text-neutral-800';
    }
  }
}
