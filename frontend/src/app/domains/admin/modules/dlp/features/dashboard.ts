import { Component, computed, inject, signal, Signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DatePipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { ApexAxisChartSeries, ApexChart, ApexDataLabels, ApexPlotOptions, ApexTooltip, ApexXAxis, ChartComponent } from 'ng-apexcharts';
import { Theming } from '@/app/core/theming';
import { environment } from '@/environments/environment';

interface Resumen {
  periodo: string; estadoLote: string; registrosCargados: number; registrosProcesados: number;
  porcentajeAvance: number; dominiosPendientes: number; dominiosSeguros: number;
  dominiosNoSeguros: number; destinatariosPendientes: number; inconsistenciasAbiertas: number;
}

@Component({
  selector: 'dlp-dashboard',
  imports: [DatePipe, ChartComponent, MatButtonModule, MatCardModule, MatIconModule],
  template: `
    <div class="mx-auto flex w-full max-w-7xl flex-auto flex-col gap-6 p-6 lg:p-8">
      <!-- Header -->
      <div class="flex flex-col gap-1">
        <div class="text-2xl font-bold tracking-tight text-[#052945]">Centro de Gobierno DLP</div>
        <div class="text-sm text-neutral-500">Periodo {{ data().periodo }} · Plataforma de riesgo, validación y cumplimiento</div>
      </div>

      <!-- Governance Score + Risk Status -->
      <div class="grid gap-5 lg:grid-cols-[1fr_2fr]">
        <!-- Score -->
        <mat-card class="border-l-4 border-[#3f9829]" appearance="filled">
          <mat-card-content class="flex flex-col items-center justify-center py-6">
            <div class="text-xs font-semibold uppercase tracking-widest text-neutral-500">Governance Score</div>
            <div class="mt-2 text-6xl font-black text-[#052945]">{{ governanceScore() }}</div>
            <div class="mt-1 text-sm font-medium" [class]="riskColor()">{{ riskLevel() }}</div>
            <div class="mt-4 flex gap-4 text-xs text-neutral-500">
              <span>Pendientes: {{ data().dominiosPendientes + data().destinatariosPendientes }}</span>
              <span>Inconsistencias: {{ data().inconsistenciasAbiertas }}</span>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Critical metrics -->
        <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          @for (m of metrics(); track m.label) {
            <mat-card [class]="'border-l-4 ' + m.border" appearance="filled">
              <mat-card-content class="flex items-center gap-3 py-4">
                <mat-icon [class]="m.iconColor" [svgIcon]="m.icon" />
                <div>
                  <div class="text-2xl font-bold text-[#052945]">{{ m.value }}</div>
                  <div class="text-xs text-neutral-500">{{ m.label }}</div>
                </div>
              </mat-card-content>
            </mat-card>
          }
        </div>
      </div>

      <!-- Workflow Status -->
      <mat-card appearance="filled">
        <mat-card-content class="flex items-center gap-3 overflow-x-auto py-3">
          <div class="text-xs font-semibold uppercase tracking-wider text-neutral-400">Workflow</div>
          @for (step of workflowSteps(); track step.label) {
            <div class="flex items-center gap-2">
              <div class="flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold" [class]="step.active ? 'bg-[#3f9829]/15 text-[#3f9829]' : 'bg-neutral-100 text-neutral-400 dark:bg-neutral-800'">
                <div class="size-2 rounded-full" [class]="step.active ? 'bg-[#3f9829]' : 'bg-neutral-300'"></div>
                {{ step.label }}
              </div>
              @if (!$last) { <mat-icon class="size-3 text-neutral-300" svgIcon="chevron-right" /> }
            </div>
          }
        </mat-card-content>
      </mat-card>

      <!-- Charts + Activity -->
      <div class="grid gap-5 lg:grid-cols-[2fr_1fr]">
        <!-- Risk distribution -->
        <mat-card appearance="filled">
          <mat-card-header>
            <div class="text-sm font-semibold text-[#052945]">Distribución de riesgo</div>
          </mat-card-header>
          <mat-card-content>
            <apx-chart class="block h-64" [chart]="barChart" [series]="barSeries()" [dataLabels]="barDataLabels" [plotOptions]="barPlotOptions" [xaxis]="barXaxis" [tooltip]="tooltip()" [colors]="['#3f9829','#052945','#f59e0b','#ef4444']" />
          </mat-card-content>
        </mat-card>

        <!-- Activity feed -->
        <mat-card appearance="filled">
          <mat-card-header>
            <div class="text-sm font-semibold text-[#052945]">Actividad reciente</div>
          </mat-card-header>
          <mat-card-content class="max-h-72 overflow-y-auto p-0">
            @for (event of activity(); track event.id) {
              <div class="flex gap-3 border-b border-neutral-100 px-4 py-3 last:border-0 dark:border-neutral-800">
                <div class="mt-0.5 size-2 shrink-0 rounded-full bg-[#3f9829]"></div>
                <div class="min-w-0">
                  <div class="truncate text-xs font-medium">{{ event.accion }}</div>
                  <div class="mt-0.5 truncate text-[10px] text-neutral-400">{{ event.usuario }} · {{ event.fechaEvento | date:'short' }}</div>
                </div>
              </div>
            } @empty {
              <div class="px-4 py-6 text-center text-xs text-neutral-400">Sin actividad reciente</div>
            }
          </mat-card-content>
        </mat-card>
      </div>

      <!-- Lots table -->
      <mat-card appearance="filled">
        <mat-card-header>
          <div class="text-sm font-semibold text-[#052945]">Lotes procesados</div>
        </mat-card-header>
        <mat-card-content class="overflow-auto p-0">
          <table class="w-full min-w-140 text-left text-xs">
            <thead class="bg-neutral-50 text-neutral-500 dark:bg-neutral-800/50">
              <tr><th class="px-4 py-2.5">ID</th><th>Periodo</th><th>Estado</th><th>Cargados</th><th>Procesados</th><th>Responsable</th></tr>
            </thead>
            <tbody>
              @for (lote of lotes(); track lote.id) {
                <tr class="border-t border-neutral-100 dark:border-neutral-800">
                  <td class="px-4 py-2.5 font-medium">{{ lote.id }}</td>
                  <td>{{ lote.periodoAnio }}-{{ lote.periodoMes }}</td>
                  <td><span class="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase" [class]="estadoClass(lote.estado)">{{ lote.estado }}</span></td>
                  <td>{{ lote.registrosCargados }}</td>
                  <td>{{ lote.registrosProcesados }}</td>
                  <td class="text-neutral-500">{{ lote.usuarioCarga }}</td>
                </tr>
              } @empty {
                <tr><td colspan="6" class="px-4 py-6 text-center text-neutral-400">Sin lotes</td></tr>
              }
            </tbody>
          </table>
        </mat-card-content>
      </mat-card>
    </div>
  `,
})
export default class DlpDashboard {
  private http = inject(HttpClient);
  private theming = inject(Theming);
  private base = environment.apiUrl;

  protected data = signal<Resumen>({
    periodo: '-', estadoLote: '-', registrosCargados: 0, registrosProcesados: 0,
    porcentajeAvance: 0, dominiosPendientes: 0, dominiosSeguros: 0, dominiosNoSeguros: 0,
    destinatariosPendientes: 0, inconsistenciasAbiertas: 0,
  });
  protected lotes = signal<any[]>([]);
  protected activity = signal<any[]>([]);

  protected governanceScore = computed(() => {
    const d = this.data();
    const totalPendientes = d.dominiosPendientes + d.destinatariosPendientes + d.inconsistenciasAbiertas;
    const total = Math.max(d.registrosCargados, 1);
    return Math.max(0, Math.round(100 - (totalPendientes / total) * 1000));
  });

  protected riskLevel = computed(() => {
    const score = this.governanceScore();
    if (score >= 90) return 'BAJO';
    if (score >= 70) return 'MEDIO';
    if (score >= 50) return 'ALTO';
    return 'CRÍTICO';
  });

  protected riskColor = computed(() => {
    const level = this.riskLevel();
    if (level === 'BAJO') return 'text-[#3f9829]';
    if (level === 'MEDIO') return 'text-amber-500';
    if (level === 'ALTO') return 'text-orange-500';
    return 'text-red-600';
  });

  protected metrics = computed(() => {
    const d = this.data();
    return [
      { label: 'Registros cargados', value: d.registrosCargados.toLocaleString(), icon: 'database', iconColor: 'text-[#052945]', border: 'border-[#052945]' },
      { label: 'Dominios seguros', value: String(d.dominiosSeguros), icon: 'shield-check', iconColor: 'text-[#3f9829]', border: 'border-[#3f9829]' },
      { label: 'Dominios pendientes', value: String(d.dominiosPendientes), icon: 'globe-lock', iconColor: 'text-amber-500', border: 'border-amber-500' },
      { label: 'Destinatarios pendientes', value: String(d.destinatariosPendientes), icon: 'mail-question-mark', iconColor: 'text-orange-500', border: 'border-orange-500' },
      { label: 'Inconsistencias', value: String(d.inconsistenciasAbiertas), icon: 'badge-alert', iconColor: 'text-red-600', border: 'border-red-600' },
      { label: 'Avance', value: d.porcentajeAvance + '%', icon: 'activity', iconColor: 'text-[#3f9829]', border: 'border-[#3f9829]' },
    ];
  });

  protected workflowSteps = computed(() => {
    const estado = this.data().estadoLote;
    const steps = [
      { key: 'CARGANDO', label: 'Carga' },
      { key: 'VALIDADO', label: 'Validado' },
      { key: 'PROCESANDO', label: 'Procesando' },
      { key: 'CON_OBSERVACIONES', label: 'Observaciones' },
      { key: 'PROCESADO', label: 'Completado' },
    ];
    const activeIdx = steps.findIndex(s => s.key === estado);
    return steps.map((s, i) => ({ label: s.label, active: i <= activeIdx }));
  });

  protected tooltip: Signal<ApexTooltip> = computed(() => ({ theme: this.theming.isDark() ? 'dark' : 'light' }));
  protected barChart: ApexChart = { type: 'bar', height: '100%', toolbar: { show: false }, fontFamily: 'inherit' };
  protected barDataLabels: ApexDataLabels = { enabled: false };
  protected barPlotOptions: ApexPlotOptions = { bar: { borderRadius: 4, columnWidth: '50%', distributed: true } };
  protected barXaxis: ApexXAxis = { categories: ['Seguros', 'No seguros', 'Pendientes', 'Inconsistentes'] };
  protected barSeries = computed<ApexAxisChartSeries>(() => {
    const d = this.data();
    return [{ name: 'Registros', data: [d.dominiosSeguros, d.dominiosNoSeguros, d.dominiosPendientes + d.destinatariosPendientes, d.inconsistenciasAbiertas] }];
  });

  estadoClass(estado: string): string {
    switch (estado) {
      case 'PROCESADO': case 'CERRADO': return 'bg-[#3f9829]/15 text-[#3f9829]';
      case 'CON_OBSERVACIONES': return 'bg-amber-100 text-amber-700';
      case 'PROCESANDO': return 'bg-blue-100 text-blue-700';
      case 'ERROR': return 'bg-red-100 text-red-700';
      default: return 'bg-neutral-100 text-neutral-600';
    }
  }

  constructor() {
    this.http.get<any>(`${this.base}/dashboard/resumen`).subscribe((res) => { if (res.data) this.data.set(res.data); });
    this.http.get<any>(`${this.base}/lotes`).subscribe((res) => { if (res.data) this.lotes.set(res.data); });
    this.http.get<any>(`${this.base}/auditoria`).subscribe((res) => { if (res.data) this.activity.set(res.data.slice(0, 10)); });
  }
}
