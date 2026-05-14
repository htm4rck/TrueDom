import { Component, inject, signal, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { environment } from '@/environments/environment';
import { WebSocketService, ProgresoLote } from '../services/websocket.service';

@Component({
  selector: 'dlp-carga-lote',
  imports: [DecimalPipe, FormsModule, MatButtonModule, MatCardModule, MatIconModule, MatInputModule, MatSelectModule, MatProgressBarModule],
  template: `
    <div class="mx-auto flex w-full max-w-7xl flex-auto flex-col gap-5 p-6 lg:p-8">
      <div class="flex items-end gap-4">
        <div>
          <div class="text-2xl font-semibold tracking-tight">Carga de lote DLP</div>
          <div class="mt-1 text-sm text-neutral-500">Sube el archivo mensual. El procesamiento es en tiempo real.</div>
        </div>
      </div>

      @if (!progreso()) {
        <!-- Upload form -->
        <div class="grid gap-5 lg:grid-cols-[1fr_24rem]">
          <mat-card appearance="filled">
            <mat-card-content
              class="flex min-h-80 flex-col items-center justify-center border-2 border-dashed text-center"
              [class.border-[#2D7FF9]]="archivo()"
              [class.border-neutral-300]="!archivo()"
              (dragover)="$event.preventDefault()"
              (drop)="onDrop($event)">
              @if (archivo()) {
                <mat-icon class="mb-3 size-10 text-[#2D7FF9]" svgIcon="file-check" />
                <div class="text-lg font-semibold">{{ archivo()!.name }}</div>
                <div class="mt-1 text-sm text-neutral-500">{{ (archivo()!.size / 1024 / 1024).toFixed(1) }} MB</div>
                <button class="mt-4" matButton="tonal" (click)="archivo.set(null)">Cambiar archivo</button>
              } @else {
                <mat-icon class="mb-3 size-10 text-neutral-400" svgIcon="cloud-upload" />
                <div class="text-lg font-semibold">Archivo DLP mensual</div>
                <div class="mt-1 max-w-md text-sm text-neutral-500">XLSX con las columnas del reporte DLP (Politica, Usuario, Dominio, Destinatario, etc.)</div>
                <button class="mt-5" matButton="tonal" (click)="fileInput.click()">
                  <mat-icon svgIcon="folder-open" />Seleccionar archivo
                </button>
                <input #fileInput type="file" accept=".csv,.xlsx,.xls" class="hidden" (change)="onFileSelect($event)" />
              }
            </mat-card-content>
          </mat-card>

          <mat-card appearance="filled">
            <mat-card-content class="flex flex-col gap-4">
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
              <mat-form-field appearance="outline">
                <mat-label>Usuario</mat-label>
                <input matInput [(ngModel)]="usuario" />
              </mat-form-field>

              @if (error()) {
                <div class="rounded-md bg-red-50 p-3 text-sm text-red-800 dark:bg-red-900/20 dark:text-red-300">{{ error() }}</div>
              }

              <button matButton="filled" [disabled]="!archivo() || subiendo()" (click)="cargar()">
                <mat-icon svgIcon="cloud-upload" />Iniciar carga
              </button>
            </mat-card-content>
          </mat-card>
        </div>
      } @else {
        <!-- Progress view -->
        <mat-card appearance="filled">
          <mat-card-content class="py-8">
            <div class="flex flex-col items-center gap-4">
              @if (progreso()!.fase === 'COMPLETADO') {
                <mat-icon class="size-12 text-[#3f9829]" svgIcon="circle-check" />
                <div class="text-xl font-bold text-[#071B2A]">Carga completada</div>
              } @else if (progreso()!.fase === 'ERROR') {
                <mat-icon class="size-12 text-red-600" svgIcon="circle-x" />
                <div class="text-xl font-bold text-red-600">Error en la carga</div>
              } @else {
                <mat-icon class="size-12 text-[#2D7FF9] animate-pulse" svgIcon="loader" />
                <div class="text-xl font-bold text-[#071B2A]">Procesando archivo...</div>
              }

              <div class="w-full max-w-lg">
                <mat-progress-bar [mode]="progreso()!.fase === 'COMPLETADO' ? 'determinate' : 'buffer'" [value]="progreso()!.porcentaje" [bufferValue]="progreso()!.porcentaje + 5" />
              </div>

              <div class="text-center">
                <div class="text-3xl font-black text-[#071B2A]">{{ progreso()!.porcentaje }}%</div>
                <div class="mt-1 text-sm text-neutral-500">{{ progreso()!.mensaje }}</div>
              </div>

              <div class="mt-4 grid grid-cols-3 gap-6 text-center text-sm">
                <div>
                  <div class="text-2xl font-bold text-[#071B2A]">{{ progreso()!.registrosLeidos | number }}</div>
                  <div class="text-neutral-500">Registros</div>
                </div>
                <div>
                  <div class="text-2xl font-bold text-[#071B2A]">{{ progreso()!.dominiosEncontrados }}</div>
                  <div class="text-neutral-500">Dominios</div>
                </div>
                <div>
                  <div class="text-2xl font-bold text-[#071B2A]">{{ progreso()!.destinatariosEncontrados }}</div>
                  <div class="text-neutral-500">Destinatarios</div>
                </div>
              </div>

              @if (progreso()!.fase === 'COMPLETADO') {
                <button class="mt-6" matButton="filled" (click)="irAResultados()">
                  <mat-icon svgIcon="chart-column" />Ver resultados del procesamiento
                </button>
              }
            </div>
          </mat-card-content>
        </mat-card>
      }
    </div>
  `,
})
export default class CargaLotePage implements OnDestroy {
  private http = inject(HttpClient);
  private wsService = inject(WebSocketService);
  private router = inject(Router);

  protected archivo = signal<File | null>(null);
  protected subiendo = signal(false);
  protected error = signal<string | null>(null);
  protected progreso = signal<ProgresoLote | null>(null);
  protected loteId = signal<number | null>(null);
  private unsubscribe: (() => void) | null = null;

  protected mes = '5';
  protected anio = 2026;
  protected usuario = 'admin.dlp@alicorp.com.pe';
  protected meses = [
    { value: '1', label: 'Enero' }, { value: '2', label: 'Febrero' }, { value: '3', label: 'Marzo' },
    { value: '4', label: 'Abril' }, { value: '5', label: 'Mayo' }, { value: '6', label: 'Junio' },
    { value: '7', label: 'Julio' }, { value: '8', label: 'Agosto' }, { value: '9', label: 'Septiembre' },
    { value: '10', label: 'Octubre' }, { value: '11', label: 'Noviembre' }, { value: '12', label: 'Diciembre' },
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
      next: (res) => {
        const id = res.data?.id;
        this.loteId.set(id);
        this.progreso.set({ loteId: id, fase: 'INICIANDO', registrosLeidos: 0, totalEstimado: 0, porcentaje: 0, dominiosEncontrados: 0, destinatariosEncontrados: 0, mensaje: 'Conectando...' });
        // Subscribe to WebSocket for progress
        this.unsubscribe = this.wsService.subscribeLote(id, (p) => this.progreso.set(p));
      },
      error: (err) => {
        this.error.set(err.error?.error || err.error?.message || 'Error al iniciar la carga');
        this.subiendo.set(false);
      },
    });
  }

  irAResultados() {
    this.router.navigate(['/admin/lotes', this.loteId(), 'resultado']);
  }

  ngOnDestroy() {
    if (this.unsubscribe) this.unsubscribe();
  }
}
