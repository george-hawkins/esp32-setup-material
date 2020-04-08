import { Component, OnInit } from '@angular/core';

import { tap } from 'rxjs/operators';

import { MatDialog, MatDialogState, MatDialogRef } from '@angular/material/dialog';

import { AccessPointsService } from '../access-points.service';
import { SpinnerOverlayService } from '../spinner-overlay.service';

import { AuthDialogComponent } from '../auth-dialog/auth-dialog.component';
import { ResultDialogComponent } from '../result-dialog/result-dialog.component';

import { AccessPoint } from '../AccessPoint';
import { ConnectResponse, ConnectStatus } from '../ConnectResponse';

import { timer } from 'rxjs';
import { takeWhile } from 'rxjs/operators';

// 250px looks narrow on a large screen but is about right for smartphones.
const DIALOG_WIDTH = '250px';

const KEEP_ALIVE_INTERVAL = 2; // 2s.

@Component({
  selector: 'app-access-points',
  templateUrl: './access-points.component.html'
})
export class AccessPointsComponent implements OnInit {
  private fetching = false;
  points: AccessPoint[];

  constructor(
    public dialog: MatDialog,
    private accessPointsService: AccessPointsService,
    private spinnerService: SpinnerOverlayService) { }

  ngOnInit(): void {
    this.spinnerService.show();
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
        this.spinnerService.show();
      }
    });
  }

  // Start a timer that repeatedly tells the backend to stay alive (until the dialog is closed).
  private keepAlive(dialogRef: MatDialogRef<ResultDialogComponent>): void {
    // The dialog state immediately becomes OPEN (you don't have to subscribe for afterOpened).
    timer(0, KEEP_ALIVE_INTERVAL * 1000).pipe(
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
    // TODO: is there a standard Angular way to not make a request if the last such request hasn't completed yet?
    if (this.fetching) {
      return;
    }
    this.fetching = true;

    // Subscribe for access points and sort them by SSID when received.
    // Nomally Android displays SSIDs sorted by RSSI but as of MicroPython 1.12 RSSI is not available for the ESP32 port.
    this.accessPointsService.getAccessPoints()
      .pipe(
        tap(_0 => this.spinnerService.hide()),
        tap(_0 => this.fetching = false)
      )
      .subscribe(points => this.points = points.sort((a, b) => a.ssid.localeCompare(b.ssid)));
  }
}
