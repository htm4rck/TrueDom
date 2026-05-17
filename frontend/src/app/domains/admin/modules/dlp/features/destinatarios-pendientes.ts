import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { DlpApiService, PendienteDestinatario } from '../services/dlp-api.service';
import { ValidacionDialogComponent } from './validacion-dialog';

interface PeriodoNodo {
  anio: number;
  meses: number[];
  expanded: boolean;
  selected: boolean;
  mesesSeleccionados: Set<number>;
}

const MESES_NOMBRE = ['', 'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

@Component({
  selector: 'dlp-destinatarios-pendientes',
  imports: [MatButtonModule, MatCardModule, MatIconModule, MatCheckboxModule, MatDialogModule],
  template: `
    <div class="mx-auto flex w-full max-w-7xl flex-auto flex-col gap-5 p-6 lg:p-8">
      <div>
        <div class="text-2xl font-semibold tracking-tight">Bandeja de destinatarios pendientes</div>
        <div class="mt-1 text-sm text-neutral-500">Selecciona periodos para filtrar las validaciones pendientes.</div>
      </div>

      <div class="flex gap-6">
        <!-- Tree filter -->
        <div class="w-56 shrink-0">
          <mat-card appearance="filled">
            <mat-card-content class="p-4">
              <div class="mb-3 text-sm font-semibold text-neutral-600">Periodos</div>
              @for (nodo of periodos(); track nodo.anio) {
                <div class="mb-1">
                  <div class="flex items-center gap-1">
                    <button class="flex h-6 w-6 items-center justify-center rounded hover:bg-neutral-100" (click)="toggleExpand(nodo)">
                      <mat-icon class="!text-base" [svgIcon]="nodo.expanded ? 'expand-more' : 'chevron-right'" />
                    </button>
                    <mat-checkbox [checked]="nodo.selected" [indeterminate]="isIndeterminate(nodo)" (change)="toggleAnio(nodo)">
                      {{ nodo.anio }}
                    </mat-checkbox>
                  </div>
                  @if (nodo.expanded) {
                    <div class="ml-8 flex flex-col gap-0.5">
                      @for (mes of nodo.meses; track mes) {
                        <mat-checkbox [checked]="nodo.mesesSeleccionados.has(mes)" (change)="toggleMes(nodo, mes)">
                          {{ nombreMes(mes) }}
                        </mat-checkbox>
                      }
                    </div>
                  }
                </div>
              }
              <button matButton="filled" class="mt-3 w-full" (click)="buscar()">
                <mat-icon svgIcon="search" />Filtrar
              </button>
            </mat-card-content>
          </mat-card>
        </div>

        <!-- Table -->
        <div class="flex-auto">
          @if (totalItems() > 0) {
            <div class="mb-2 text-sm text-neutral-500">{{ totalItems() }} pendientes. Página {{ page() + 1 }} de {{ totalPages() }}.</div>
          }
          <mat-card appearance="filled">
            <mat-card-content class="overflow-auto p-0">
              <table class="w-full min-w-140 text-left text-sm">
                <thead class="bg-neutral-50 text-neutral-500 dark:bg-neutral-800/50">
                  <tr>
                    <th class="px-5 py-3">Destinatario</th>
                    <th>Dominio</th>
                    <th>Usuario Alicorp</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  @for (item of paginatedItems(); track item.id) {
                    <tr class="border-t">
                      <td class="px-5 py-3 font-medium">{{ item.destinatario }}</td>
                      <td>{{ item.dominio }}</td>
                      <td>{{ item.correoUsuarioAlicorp }}</td>
                      <td class="flex gap-2 py-2">
                        <button matButton="filled" class="!bg-emerald-600" (click)="validar(item, 'SEGURO')">Seguro</button>
                        <button matButton="filled" class="!bg-red-600" (click)="validar(item, 'NO_SEGURO')">No seguro</button>
                      </td>
                    </tr>
                  } @empty {
                    <tr><td colspan="4" class="px-5 py-12 text-center text-neutral-400">
                      Selecciona periodos y presiona Filtrar para ver pendientes.
                    </td></tr>
                  }
                </tbody>
              </table>
            </mat-card-content>
          </mat-card>

          @if (totalPages() > 1) {
            <div class="mt-3 flex items-center justify-center gap-2">
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
      </div>
    </div>
  `,
})
export default class DestinatariosPendientesPage implements OnInit {
  private api = inject(DlpApiService);
  private dialog = inject(MatDialog);
  protected periodos = signal<PeriodoNodo[]>([]);
  private allItems = signal<PendienteDestinatario[]>([]);
  protected page = signal(0);
  private pageSize = 20;

  protected totalItems = computed(() => this.allItems().length);
  protected totalPages = computed(() => Math.max(1, Math.ceil(this.allItems().length / this.pageSize)));
  protected paginatedItems = computed(() => {
    const start = this.page() * this.pageSize;
    return this.allItems().slice(start, start + this.pageSize);
  });

  ngOnInit() {
    this.api.getPeriodosDisponibles().subscribe((data) => {
      this.periodos.set(
        data.map((p) => ({
          anio: p.anio,
          meses: p.meses,
          expanded: true,
          selected: true,
          mesesSeleccionados: new Set(p.meses),
        })),
      );
      this.buscar();
    });
  }

  nombreMes(mes: number): string {
    return MESES_NOMBRE[mes] || '';
  }

  toggleExpand(nodo: PeriodoNodo) {
    nodo.expanded = !nodo.expanded;
  }

  toggleAnio(nodo: PeriodoNodo) {
    nodo.selected = !nodo.selected;
    if (nodo.selected) {
      nodo.mesesSeleccionados = new Set(nodo.meses);
    } else {
      nodo.mesesSeleccionados = new Set();
    }
  }

  toggleMes(nodo: PeriodoNodo, mes: number) {
    if (nodo.mesesSeleccionados.has(mes)) {
      nodo.mesesSeleccionados.delete(mes);
    } else {
      nodo.mesesSeleccionados.add(mes);
    }
    nodo.selected = nodo.mesesSeleccionados.size === nodo.meses.length;
  }

  isIndeterminate(nodo: PeriodoNodo): boolean {
    return nodo.mesesSeleccionados.size > 0 && nodo.mesesSeleccionados.size < nodo.meses.length;
  }

  buscar() {
    const anios: number[] = [];
    const meses: number[] = [];
    for (const nodo of this.periodos()) {
      if (nodo.mesesSeleccionados.size > 0) {
        anios.push(nodo.anio);
        for (const m of nodo.mesesSeleccionados) {
          meses.push(m);
        }
      }
    }
    this.page.set(0);
    this.api.getPendientesDestinatarios(anios, meses).subscribe((data) => this.allItems.set(data));
  }

  validar(item: PendienteDestinatario, decision: string) {
    const ref = this.dialog.open(ValidacionDialogComponent, {
      data: { titulo: `Marcar ${item.destinatario} como ${decision}`, decision },
      width: '400px',
    });
    ref.afterClosed().subscribe((result) => {
      if (result) {
        this.api.validarDestinatario(item.id, decision, result.justificacion, result.usuario).subscribe(() => this.buscar());
      }
    });
  }
}
