import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'dlp-validacion-dialog',
  imports: [FormsModule, MatButtonModule, MatDialogModule, MatInputModule],
  template: `
    <h2 mat-dialog-title>{{ data.titulo }}</h2>
    <mat-dialog-content>
      <mat-form-field class="w-full" appearance="outline">
        <mat-label>Justificacion</mat-label>
        <textarea matInput [(ngModel)]="justificacion" rows="3" required></textarea>
      </mat-form-field>
      <mat-form-field class="w-full" appearance="outline">
        <mat-label>Usuario</mat-label>
        <input matInput [(ngModel)]="usuario" required />
      </mat-form-field>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button matButton mat-dialog-close>Cancelar</button>
      <button matButton="filled" [disabled]="!justificacion || !usuario" (click)="confirmar()">Confirmar</button>
    </mat-dialog-actions>
  `,
})
export class ValidacionDialogComponent {
  protected data = inject<{ titulo: string; decision: string }>(MAT_DIALOG_DATA);
  private dialogRef = inject(MatDialogRef<ValidacionDialogComponent>);
  protected justificacion = '';
  protected usuario = '';

  confirmar() {
    this.dialogRef.close({ justificacion: this.justificacion, usuario: this.usuario });
  }
}
