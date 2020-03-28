import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AccessPoint } from '../AccessPoint';

@Component({
  selector: 'app-auth-dialog',
  templateUrl: './auth-dialog.component.html'
})
export class AuthDialogComponent {
  password = '';
  hide = true;

  constructor(
    private dialogRef: MatDialogRef<AuthDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: AccessPoint
  ) { }

  onCancel(): void {
    this.dialogRef.close();
  }
}
