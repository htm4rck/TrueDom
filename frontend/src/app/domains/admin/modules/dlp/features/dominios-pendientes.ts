import { Component, inject, signal, computed } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { DlpApiService, PendienteDominio } from '../services/dlp-api.service';
import { ValidacionDialogComponent } from './validacion-dialog';

@Component({
  selector: 'dlp-dominios-pendientes',
  imports: [MatButtonModule, MatCardModule, MatIconModule, MatDialogModule],
  template: `
    <div class="mx-auto flex w-full max-w-7xl flex-auto flex-col gap-5 p-6 lg:p-8">
      <div class="flex items-end gap-4">
        <div>
          <div class="text-2xl font-semibold tracking-tight">Bandeja de dominios pendientes</div>
          <div class="mt-1 text-sm text-neutral-500">{{ totalItems() }} dominios sin clasificar. Expande para ver contexto antes de decidir.</div>
        </div>
      </div>

      @for (item of paginatedItems(); track item.id) {
        <mat-card appearance="filled">
          <mat-card-content class="p-0">
            <!-- Row principal -->
            <div class="flex items-center gap-4 px-5 py-4 cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-800/50" (click)="toggleExpand(item.id)">
              <mat-icon class="size-4 transition-transform" [class.rotate-90]="expanded() === item.id" svgIcon="chevron-right" />
              <div class="min-w-0 flex-auto">
                <div class="text-base font-semibold">{{ item.dominio }}</div>
                <div class="mt-0.5 text-xs text-neutral-500">{{ item.totalRegistros }} registros · {{ item.totalUsuarios }} usuarios afectados</div>
              </div>
              <div class="flex gap-2">
                <button matButton="filled" class="!bg-emerald-600" (click)="validar(item, 'SEGURO', $event)">
                  <mat-icon svgIcon="shield-check" />Seguro
                </button>
                <button matButton="filled" class="!bg-red-600" (click)="validar(item, 'NO_SEGURO', $event)">
                  <mat-icon svgIcon="shield-x" />No seguro
                </button>
              </div>
            </div>

            <!-- Detalle expandido -->
            @if (expanded() === item.id) {
              <div class="border-t bg-neutral-50/50 px-5 py-4 dark:bg-neutral-800/30">
                @if (detalleLoading()) {
                  <div class="text-sm text-neutral-400">Cargando detalle...</div>
                } @else {
                  <div class="mb-3 rounded-md bg-white p-3 dark:bg-neutral-900">
                    <div class="text-lg font-bold text-[#071B2A]">{{ detalleData().dominio }}</div>
                    <div class="text-xs text-neutral-500">{{ detalleData().totalRegistros }} registros · {{ detalleData().totalUsuarios }} usuarios</div>
                  </div>
                  <div class="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-2">Destinatarios y usuarios que envían a este dominio</div>
                  <table class="w-full text-xs">
                    <thead class="text-neutral-500"><tr><th class="text-left py-1">Destinatario externo</th><th class="text-left py-1">Usuario Alicorp responsable</th></tr></thead>
                    <tbody>
                      @for (d of detalle(); track $index) {
                        <tr class="border-t border-neutral-200 dark:border-neutral-700">
                          <td class="py-1.5 font-medium">{{ d.destinatario }}</td>
                          <td class="py-1.5">{{ d.usuarioAlicorp }}</td>
                        </tr>
                      } @empty {
                        <tr><td colspan="2" class="py-2 text-neutral-400">Sin detalle disponible</td></tr>
                      }
                    </tbody>
                  </table>
                }
              </div>
            }
          </mat-card-content>
        </mat-card>
      } @empty {
        <mat-card appearance="filled">
          <mat-card-content class="py-12 text-center text-neutral-400">Sin dominios pendientes de validación</mat-card-content>
        </mat-card>
      }

      <!-- Paginación -->
      @if (totalPages() > 1) {
        <div class="flex items-center justify-center gap-2">
          <button matButton="tonal" [disabled]="page() === 0" (click)="page.set(page() - 1)">
            <mat-icon svgIcon="chevron-left" />Anterior
          </button>
          <span class="text-sm text-neutral-500">{{ page() + 1 }} / {{ totalPages() }}</span>
          <button matButton="tonal" [disabled]="page() >= totalPages() - 1" (click)="page.set(page() + 1)">
            Siguiente<mat-icon svgIcon="chevron-right" />
          </button>
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
  protected detalle = signal<any[]>([]);
  protected detalleData = signal<any>({ dominio: '', totalRegistros: 0, totalUsuarios: 0 });
  protected detalleLoading = signal(false);
  private pageSize = 15;

  protected totalItems = computed(() => this.allItems().length);
  protected totalPages = computed(() => Math.max(1, Math.ceil(this.allItems().length / this.pageSize)));
  protected paginatedItems = computed(() => {
    const start = this.page() * this.pageSize;
    return this.allItems().slice(start, start + this.pageSize);
  });

  constructor() {
    this.cargar();
  }

  private cargar() {
    this.api.getDominiosPendientes().subscribe((data) => this.allItems.set(data));
  }

  toggleExpand(id: number) {
    if (this.expanded() === id) {
      this.expanded.set(null);
      return;
    }
    this.expanded.set(id);
    this.detalle.set([]);
    this.detalleData.set({ dominio: '', totalRegistros: 0, totalUsuarios: 0 });
    this.detalleLoading.set(true);
    this.api.getDetallePendienteDominio(id).subscribe({
      next: (data: any) => {
        this.detalleData.set({ dominio: data.dominio, totalRegistros: data.totalRegistros, totalUsuarios: data.totalUsuarios });
        this.detalle.set(data.asociados || []);
        this.detalleLoading.set(false);
      },
      error: () => this.detalleLoading.set(false),
    });
  }

  validar(item: PendienteDominio, decision: string, event: Event) {
    event.stopPropagation();
    const ref = this.dialog.open(ValidacionDialogComponent, {
      data: { titulo: `Marcar "${item.dominio}" como ${decision === 'SEGURO' ? 'SEGURO (lista blanca)' : 'NO SEGURO (lista negra)'}`, decision },
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
}
