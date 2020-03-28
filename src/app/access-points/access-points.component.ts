import { Component, OnInit } from '@angular/core';

import { MatDialog, MatDialogState, MatDialogRef } from '@angular/material/dialog';

import { AccessPointsService } from '../access-points.service';
import { AliveService } from '../alive.service';

import { AuthDialogComponent } from '../auth-dialog/auth-dialog.component';
import { ResultDialogComponent } from '../result-dialog/result-dialog.component';

import { AccessPoint } from '../AccessPoint';
import { ConnectResponse, ConnectStatus } from '../ConnectResponse';

import { timer } from 'rxjs';
import { takeWhile } from 'rxjs/operators';

// 250px looks narrow on a large screen but is about right for smartphones.
const DIALOG_WIDTH = '250px';

const KEEP_ALIVE_INTERVAL = 2000; // 2s.

@Component({
  selector: 'app-access-points',
  templateUrl: './access-points.component.html'
})
export class AccessPointsComponent implements OnInit {
  points: AccessPoint[];

  constructor(
    public dialog: MatDialog,
    private accessPointsService: AccessPointsService,
    private aliveService: AliveService) { }

  ngOnInit(): void {
    this.getAccessPoints();
  }

  openAuthDialog(point: AccessPoint): void {
    const dialogRef = this.dialog.open(AuthDialogComponent, {
      width: DIALOG_WIDTH,
      data: point
    });

    dialogRef.afterClosed().subscribe(password => this.onAuthClosed(point, password));
  }

  private openResultDialog(response: ConnectResponse): void {
    const dialogRef = this.dialog.open(ResultDialogComponent, {
      width: DIALOG_WIDTH,
      data: response
    });

    const success = response.status === ConnectStatus.SUCCESS;

    if (success) {
      this.keepAlive(dialogRef);
    }

    dialogRef.afterClosed().subscribe(_0 => {
      console.log('Result dialog was closed.');
      if (success) {
        this.aliveService.nextAlive(false);
      }
    });
  }

  // Start a timer that repeatedly tells the backend to stay alive (until the dialog is closed).
  private keepAlive(dialogRef: MatDialogRef<ResultDialogComponent>): void {
    // The dialog state immediately becomes OPEN (you don't have to subscribe for afterOpened).
    timer(0, KEEP_ALIVE_INTERVAL).pipe(
      takeWhile(_0 => dialogRef.getState() === MatDialogState.OPEN)
    ).subscribe(() => {
      this.accessPointsService.keepAlive(KEEP_ALIVE_INTERVAL)
        .subscribe(); // Without a subscribe the underlying request doesn't happen.
    });
  }

  private onAuthClosed(point: AccessPoint, password: string): void {
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
        this.openResultDialog(response);
      });
  }

  getAccessPoints(): void {
    // Subscribe for access points and sort them by SSID when received.
    // Nomally Android displays SSIDs sorted by RSSI but as of MicroPython 1.12 RSSI is not available for the ESP32 port.
    this.accessPointsService.getAccessPoints()
      .subscribe(points => this.points = points.sort((a, b) => a.ssid.localeCompare(b.ssid)));
  }
}
