import { Component, OnInit } from '@angular/core';

import { MatDialog } from '@angular/material/dialog';

import { AccessPointsService } from '../access-points.service';
import { AuthDialogComponent } from '../auth-dialog/auth-dialog.component';
import { ResultDialogComponent } from '../result-dialog/result-dialog.component';

import { AccessPoint } from '../AccessPoint';
import { ConnectResponse } from '../ConnectResponse';

// 250px looks narrow on a large screen but is about right for smartphones.
const DIALOG_WIDTH = '250px';

@Component({
  selector: 'app-access-points',
  templateUrl: './access-points.component.html',
  styles: []
})
export class AccessPointsComponent implements OnInit {
  points: AccessPoint[];

  constructor(public dialog: MatDialog, private accessPointsService: AccessPointsService) { }

  ngOnInit(): void {
    this.getAccessPoints();
  }

  openAuthDialog(point: AccessPoint): void {
    let dialogRef = this.dialog.open(AuthDialogComponent, {
      width: DIALOG_WIDTH,
      data: point
    });

    dialogRef.afterClosed().subscribe(password => this.onAuthClosed(point, password));
  }

  private openResultDialog(response: ConnectResponse): void {
    let dialogRef = this.dialog.open(ResultDialogComponent, {
      width: DIALOG_WIDTH,
      data: response
    });

    dialogRef.afterClosed().subscribe(_0 => {
      console.log('Result dialog was closed.')
    });
  }

  private onAuthClosed(point: AccessPoint, password: string) {
    if (password === undefined) {
      console.log('Nothing was entered.');
      return;
    }
    console.log('Attempting to connect to', point.ssid);

    this.connect(point, password);
  }

  private connect(point: AccessPoint, password: string): void {
    this.accessPointsService.connect(point, password)
      .subscribe(response => {
        console.log('Connect response (at component level):', response);
        this.openResultDialog(response)
      });
  }

  getAccessPoints(): void {
    // Subscribe for access points and sort them by SSID when received.
    // Nomally Android displays SSIDs sorted by RSSI but as of MicroPython 1.12 RSSI is not available for the ESP32 port.
    this.accessPointsService.getAccessPoints()
      .subscribe(points => this.points = points.sort((a, b) => a.ssid.localeCompare(b.ssid)));
  }
}
