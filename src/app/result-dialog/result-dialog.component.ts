import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ConnectResponse, ConnectStatus } from '../ConnectResponse';

@Component({
  selector: 'app-result-dialog',
  templateUrl: './result-dialog.component.html'
})
export class ResultDialogComponent {
  connectStatus = ConnectStatus; // Make enum available to HTML template.

  constructor(@Inject(MAT_DIALOG_DATA) public data: ConnectResponse) { }
}
