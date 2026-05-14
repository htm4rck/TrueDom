import { Component, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { environment } from '@/environments/environment';
import { ValidacionDialogComponent } from './validacion-dialog';

@Component({
  selector: 'dlp-procesamiento-resultado',
  imports: [FormsModule, MatButtonModule, MatCardModule, MatIconModule, MatInputModule, MatSelectModule, MatTabsModule, MatDialogModule, RouterLink],
  template: `
    <div class="mx-auto flex w-full max-w-7xl flex-auto flex-col gap-5 p-6 lg:p-8">
      <div class="flex items-end gap-4">
        <div>
          <div class="text-2xl font-semibold tracking-tight">Resultado del procesamiento — Lote #{{ loteId }}</div>
          <div class="mt-1 text-sm text-neutral-500">Revisa dominios y destinatarios encontrados. Decide inline o envía a bandeja.</div>
        </div>
        <div class="flex-auto"></div>
        <a matButton="tonal" routerLink="/admin/lotes"><mat-icon svgIcon="arrow-left" />Volver a lotes</a>
      </div>

      <mat-tab-group>
        <!-- TAB DOMINIOS -->
        <mat-tab label="Dominios ({{ domTotal() }})">
          <div class="flex gap-3 items-end p-4">
            <mat-form-field appearance="outline" class="flex-auto">
              <mat-label>Filtrar por estado</mat-label>
              <mat-select [(value)]="domEstadoFiltro" (selectionChange)="cargarDominios()">
                <mat-option value="">Todos</mat-option>
                <mat-option value="PENDIENTE">Pendientes</mat-option>
                <mat-option value="BLANCO">Lista blanca</mat-option>
                <mat-option value="NEGRO">Lista negra</mat-option>
              </mat-select>
            </mat-form-field>
          </div>

          <div class="overflow-auto">
            <table class="w-full text-sm text-left">
              <thead class="bg-neutral-50 text-xs text-neutral-500 uppercase dark:bg-neutral-800/50">
                <tr>
                  <th class="px-4 py-3">Dominio</th>
                  <th class="px-4 py-3">Envíos</th>
                  <th class="px-4 py-3">Usuarios</th>
                  <th class="px-4 py-3">Estado</th>
                  <th class="px-4 py-3">Acciones</th>
                </tr>
              </thead>
              <tbody>
                @for (d of dominios(); track d.dominio) {
                  <tr class="border-t hover:bg-neutral-50 dark:hover:bg-neutral-800/30">
                    <td class="px-4 py-3 font-semibold">{{ d.dominio }}</td>
                    <td class="px-4 py-3">{{ d.envios }}</td>
                    <td class="px-4 py-3">{{ d.totalUsuarios }}</td>
                    <td class="px-4 py-3">
                      <span class="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase" [class]="estadoClass(d.estado)">{{ d.estado }}</span>
                    </td>
                    <td class="px-4 py-2 flex gap-1">
                      @if (d.estado === 'PENDIENTE') {
                        <button matButton="tonal" class="!text-xs" (click)="marcarDominio(d.dominio, 'SEGURO')">
                          <mat-icon svgIcon="shield-check" />Blanca
                        </button>
                        <button matButton="tonal" class="!text-xs" (click)="marcarDominio(d.dominio, 'NO_SEGURO')">
                          <mat-icon svgIcon="shield-x" />Negra
                        </button>
                      }
                    </td>
                  </tr>
                } @empty {
                  <tr><td colspan="5" class="px-4 py-8 text-center text-neutral-400">Sin dominios</td></tr>
                }
              </tbody>
            </table>
          </div>

          @if (domTotalPages() > 1) {
            <div class="flex items-center justify-center gap-3 p-4">
              <button matButton="tonal" [disabled]="domPage() === 0" (click)="domPage.set(domPage() - 1); cargarDominios()">Anterior</button>
              <span class="text-sm text-neutral-500">{{ domPage() + 1 }} / {{ domTotalPages() }}</span>
              <button matButton="tonal" [disabled]="domPage() >= domTotalPages() - 1" (click)="domPage.set(domPage() + 1); cargarDominios()">Siguiente</button>
            </div>
          }
        </mat-tab>

        <!-- TAB DESTINATARIOS -->
        <mat-tab label="Destinatarios ({{ destTotal() }})">
          <div class="flex gap-3 items-end p-4">
            <mat-form-field appearance="outline" class="flex-auto">
              <mat-label>Buscar destinatario, dominio o usuario</mat-label>
              <input matInput [(ngModel)]="destFiltro" (keyup.enter)="cargarDestinatarios()" />
            </mat-form-field>
            <button matButton="tonal" (click)="cargarDestinatarios()"><mat-icon svgIcon="search" />Filtrar</button>
          </div>

          <div class="overflow-auto">
            <table class="w-full text-sm text-left">
              <thead class="bg-neutral-50 text-xs text-neutral-500 uppercase dark:bg-neutral-800/50">
                <tr>
                  <th class="px-4 py-3">Destinatario</th>
                  <th class="px-4 py-3">Dominio</th>
                  <th class="px-4 py-3">Usuario Alicorp</th>
                  <th class="px-4 py-3">Envíos</th>
                </tr>
              </thead>
              <tbody>
                @for (d of destinatarios(); track d.destinatario) {
                  <tr class="border-t hover:bg-neutral-50 dark:hover:bg-neutral-800/30">
                    <td class="px-4 py-3 font-medium">{{ d.destinatario }}</td>
                    <td class="px-4 py-3">{{ d.dominio }}</td>
                    <td class="px-4 py-3 text-neutral-500">{{ d.usuarioAlicorp }}</td>
                    <td class="px-4 py-3">{{ d.envios }}</td>
                  </tr>
                } @empty {
                  <tr><td colspan="4" class="px-4 py-8 text-center text-neutral-400">Sin destinatarios</td></tr>
                }
              </tbody>
            </table>
          </div>

          @if (destTotalPages() > 1) {
            <div class="flex items-center justify-center gap-3 p-4">
              <button matButton="tonal" [disabled]="destPage() === 0" (click)="destPage.set(destPage() - 1); cargarDestinatarios()">Anterior</button>
              <span class="text-sm text-neutral-500">{{ destPage() + 1 }} / {{ destTotalPages() }}</span>
              <button matButton="tonal" [disabled]="destPage() >= destTotalPages() - 1" (click)="destPage.set(destPage() + 1); cargarDestinatarios()">Siguiente</button>
            </div>
          }
        </mat-tab>
      </mat-tab-group>
    </div>
  `,
})
export default class ProcesamientoResultadoPage {
  private http = inject(HttpClient);
  private route = inject(ActivatedRoute);
  private dialog = inject(MatDialog);
  protected loteId = this.route.snapshot.params['id'];

  // Dominios
  protected dominios = signal<any[]>([]);
  protected domTotal = signal(0);
  protected domPage = signal(0);
  protected domEstadoFiltro = '';
  protected domTotalPages = computed(() => Math.max(1, Math.ceil(this.domTotal() / 30)));

  // Destinatarios
  protected destinatarios = signal<any[]>([]);
  protected destTotal = signal(0);
  protected destPage = signal(0);
  protected destFiltro = '';
  protected destTotalPages = computed(() => Math.max(1, Math.ceil(this.destTotal() / 30)));

  constructor() {
    this.cargarDominios();
    this.cargarDestinatarios();
  }

  cargarDominios() {
    const params = `page=${this.domPage()}&size=30&estado=${this.domEstadoFiltro}`;
    this.http.get<any>(`${environment.apiUrl}/lotes/${this.loteId}/dominios-resultado?${params}`).subscribe((res) => {
      this.dominios.set(res.data?.items || []);
      this.domTotal.set(res.data?.total || 0);
    });
  }

  cargarDestinatarios() {
    const params = `page=${this.destPage()}&size=30&filtro=${encodeURIComponent(this.destFiltro)}`;
    this.http.get<any>(`${environment.apiUrl}/lotes/${this.loteId}/destinatarios-resultado?${params}`).subscribe((res) => {
      this.destinatarios.set(res.data?.items || []);
      this.destTotal.set(res.data?.total || 0);
    });
  }

  marcarDominio(dominio: string, decision: string) {
    const ref = this.dialog.open(ValidacionDialogComponent, {
      data: { titulo: `Marcar "${dominio}" como ${decision === 'SEGURO' ? 'LISTA BLANCA' : 'LISTA NEGRA'}`, decision },
      width: '420px',
    });
    ref.afterClosed().subscribe((result) => {
      if (result) {
        const endpoint = decision === 'SEGURO' ? 'blancos' : 'negros';
        this.http.post(`${environment.apiUrl}/dominios/${endpoint}`, {
          dominio, justificacion: result.justificacion, usuario: result.usuario
        }).subscribe(() => this.cargarDominios());
      }
    });
  }

  estadoClass(estado: string): string {
    switch (estado) {
      case 'BLANCO': return 'bg-emerald-100 text-emerald-800';
      case 'NEGRO': return 'bg-red-100 text-red-800';
      default: return 'bg-amber-100 text-amber-800';
    }
  }
}
