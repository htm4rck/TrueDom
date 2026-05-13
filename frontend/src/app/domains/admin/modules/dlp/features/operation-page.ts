import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { ActivatedRoute } from '@angular/router';
import { audit, inconsistencies, lots, pendingDomains, pendingRecipients, reports } from '../data/dlp-data';

type View = 'upload' | 'lots' | 'domains' | 'recipients' | 'domainLists' | 'recipientLists' | 'inconsistencies' | 'reports' | 'audit';

const titles: Record<View, { title: string; subtitle: string; action: string; icon: string }> = {
  upload: { title: 'Carga de lote DLP', subtitle: 'Validacion estructural, evidencia y procesamiento mensual.', action: 'Validar archivo', icon: 'upload-cloud' },
  lots: { title: 'Consulta de lotes', subtitle: 'Seguimiento por periodo, estado y volumen procesado.', action: 'Nuevo lote', icon: 'database-zap' },
  domains: { title: 'Bandeja de dominios pendientes', subtitle: 'Clasificacion administrativa de dominios no conocidos.', action: 'Validar seleccion', icon: 'globe-lock' },
  recipients: { title: 'Bandeja de destinatarios pendientes', subtitle: 'Validaciones asignadas al usuario Alicorp responsable.', action: 'Responder', icon: 'mail-question' },
  domainLists: { title: 'Listas de dominios', subtitle: 'Catalogos blanco y negro con activacion e historial.', action: 'Agregar dominio', icon: 'shield-check' },
  recipientLists: { title: 'Listas de destinatarios', subtitle: 'Destinatarios seguros/no seguros por usuario o globales.', action: 'Agregar destinatario', icon: 'user-check' },
  inconsistencies: { title: 'Inconsistencias', subtitle: 'Decisiones contradictorias y resolucion administrativa.', action: 'Resolver', icon: 'badge-alert' },
  reports: { title: 'Reportes', subtitle: 'Exportacion operativa y ejecutiva para seguimiento DLP.', action: 'Exportar', icon: 'chart-column' },
  audit: { title: 'Auditoria', subtitle: 'Trazabilidad de cargas, validaciones, listas y resoluciones.', action: 'Filtrar', icon: 'logs' },
};

@Component({
  selector: 'dlp-operation-page',
  imports: [MatButtonModule, MatCardModule, MatIconModule, MatInputModule, MatSelectModule],
  template: `
    <div class="mx-auto flex w-full max-w-7xl flex-auto flex-col gap-5 p-6 lg:p-8">
      <div class="flex flex-col gap-4 lg:flex-row lg:items-end">
        <div class="flex min-w-0 items-start gap-3">
          <div class="rounded-md bg-neutral-100 p-2 dark:bg-neutral-800"><mat-icon [svgIcon]="meta.icon" /></div>
          <div class="min-w-0">
            <div class="text-2xl font-semibold tracking-tight">{{ meta.title }}</div>
            <div class="mt-1 text-sm text-neutral-500">{{ meta.subtitle }}</div>
          </div>
        </div>
        <div class="flex-auto"></div>
        <button matButton="filled"><mat-icon [svgIcon]="meta.icon" />{{ meta.action }}</button>
      </div>

      @if (view === 'upload') {
        <div class="grid gap-5 lg:grid-cols-[1fr_24rem]">
          <mat-card appearance="filled">
            <mat-card-content class="flex min-h-80 flex-col items-center justify-center border-2 border-dashed border-neutral-300 text-center dark:border-neutral-700">
              <mat-icon class="mb-3 size-10 text-blue-600" svgIcon="file-up" />
              <div class="text-lg font-semibold">Archivo DLP mensual</div>
              <div class="mt-1 max-w-md text-sm text-neutral-500">CSV o XLSX con columnas obligatorias de politica, usuario, incidente, dominio externo y destinatario externo.</div>
              <button class="mt-5" matButton="tonal"><mat-icon svgIcon="folder-open" />Seleccionar archivo</button>
            </mat-card-content>
          </mat-card>
          <mat-card appearance="filled">
            <mat-card-content class="flex flex-col gap-4">
              <mat-form-field appearance="outline"><mat-label>Mes</mat-label><mat-select value="4"><mat-option value="4">Abril</mat-option></mat-select></mat-form-field>
              <mat-form-field appearance="outline"><mat-label>Anio</mat-label><input matInput value="2026" /></mat-form-field>
              <div class="rounded-md bg-white p-4 text-sm dark:bg-neutral-900">Columnas requeridas: 15<br />Volumen esperado: 180,000 registros<br />Evidencia: Blob Storage</div>
            </mat-card-content>
          </mat-card>
        </div>
      } @else {
        <mat-card appearance="filled">
          <mat-card-content class="grid gap-4 md:grid-cols-4">
            <mat-form-field appearance="outline"><mat-label>Periodo</mat-label><mat-select value="2026-04"><mat-option value="2026-04">Abril 2026</mat-option></mat-select></mat-form-field>
            <mat-form-field appearance="outline"><mat-label>Estado</mat-label><mat-select value="todos"><mat-option value="todos">Todos</mat-option></mat-select></mat-form-field>
            <mat-form-field class="md:col-span-2" appearance="outline"><mat-label>Buscar</mat-label><input matInput value="" /></mat-form-field>
          </mat-card-content>
        </mat-card>

        <mat-card appearance="filled">
          <mat-card-content class="overflow-auto p-0">
            <table class="w-full min-w-180 text-left text-sm">
              <thead class="text-neutral-500">
                <tr>@for (header of headers; track header) { <th class="px-6 py-3">{{ header }}</th> }</tr>
              </thead>
              <tbody>
                @for (row of rows; track row[0]) {
                  <tr class="border-t">
                    @for (cell of row; track cell) { <td class="px-6 py-4" [class.font-medium]="$index === 0">{{ cell }}</td> }
                  </tr>
                }
              </tbody>
            </table>
          </mat-card-content>
        </mat-card>
      }
    </div>
  `,
})
export class OperationPage {
  private route = inject(ActivatedRoute);
  protected view = (this.route.snapshot.data['view'] ?? 'lots') as View;
  protected meta = titles[this.view];

  protected get headers(): string[] {
    if (this.view === 'lots') return ['Periodo', 'Archivo', 'Estado', 'Cargados', 'Procesados', 'Usuario'];
    if (this.view === 'domains') return ['Dominio', 'Registros', 'Usuarios', 'Destinatarios', 'Observacion'];
    if (this.view === 'recipients') return ['Destinatario', 'Dominio', 'Incidente', 'Politica', 'Estado'];
    if (this.view === 'inconsistencies') return ['Destinatario', 'Dominio', 'Usuarios seguro', 'Usuarios no seguro', 'Estado'];
    if (this.view === 'reports') return ['Reporte', 'Descripcion', 'Formato'];
    if (this.view === 'audit') return ['Fecha', 'Usuario', 'Entidad', 'Accion'];
    return ['Elemento', 'Tipo', 'Estado', 'Usuario', 'Justificacion'];
  }

  protected get rows(): string[][] {
    if (this.view === 'lots') return lots;
    if (this.view === 'domains') return pendingDomains;
    if (this.view === 'recipients') return pendingRecipients;
    if (this.view === 'inconsistencies') return inconsistencies;
    if (this.view === 'reports') return reports;
    if (this.view === 'audit') return audit;
    return [
      ['gmail.com', 'Dominio blanco', 'Activo', 'admin.dlp@alicorp.com.pe', 'Proveedor validado'],
      ['temporary-mail.org', 'Dominio negro', 'Activo', 'admin.dlp@alicorp.com.pe', 'Correo temporal'],
      ['proveedor.qa@gmail.com', 'Destinatario blanco', 'Activo', 'usuario1@alicorp.com.pe', 'Contacto operativo'],
      ['contacto@dropbox-transfer.com', 'Destinatario negro', 'Activo', 'usuario2@alicorp.com.pe', 'Canal no autorizado'],
    ];
  }
}
