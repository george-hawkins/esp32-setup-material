import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ConnectResponse } from '../ConnectResponse';

@Component({
  selector: 'app-result-dialog',
  templateUrl: './result-dialog.component.html',
  styles: []
})
export class ResultDialogComponent implements OnInit {
  address = "192.168.0." + Math.floor(Math.random() * Math.floor(256))

  constructor(
    public dialogRef: MatDialogRef<ResultDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ConnectResponse
  ) { }

  ngOnInit(): void {
  }

}
