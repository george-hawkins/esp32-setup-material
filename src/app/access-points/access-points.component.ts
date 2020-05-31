import { Component, OnInit } from '@angular/core';

import { MatDialog, MatDialogState, MatDialogRef } from '@angular/material/dialog';

import { timer, Subject, Observable } from 'rxjs';
import { exhaustMap, takeWhile, finalize } from 'rxjs/operators';

import { AccessPointsService } from '../access-points.service';
import { SpinnerOverlayService } from '../spinner-overlay.service';

import { AuthDialogComponent } from '../auth-dialog/auth-dialog.component';
import { ResultDialogComponent } from '../result-dialog/result-dialog.component';

import { AccessPoint } from '../AccessPoint';
import { ConnectResponse, ConnectStatus } from '../ConnectResponse';
import { AuthMode } from '../AuthMode';


// 250px looks narrow on a large screen but is about right for smartphones.
const DIALOG_WIDTH = '250px';

const KEEP_ALIVE_INTERVAL = 2; // 2s.

@Component({
  selector: 'app-access-points',
  templateUrl: './access-points.component.html'
})
export class AccessPointsComponent implements OnInit {
  points: AccessPoint[];
  getAccessPoints: () => void;

  constructor(
    private dialog: MatDialog,
    private accessPointsService: AccessPointsService,
    private spinnerService: SpinnerOverlayService) { }

  ngOnInit(): void {
    this.spinnerService.show();

    this.setupAccessPointsObservable();

    this.getAccessPoints();
  }

  private setupAccessPointsObservable(): void {
    const s = new Subject<void>();

    s.asObservable().pipe(
      // `exhaustMap` ignores events if an existing request has not yet completed.
      exhaustMap(() => this.accessPointsService.getAccessPoints().pipe(
        finalize(() => this.spinnerService.hide()) // Only actually needed for very first request.
      ))
    ).subscribe(points => this.points = this.sort(points));

    this.getAccessPoints = () => s.next();
  }

  private sort(points: AccessPoint[]): AccessPoint[] {
    // First sort by RSSI like Android does.
    const sorted = points.sort((a, b) => b.rssi - a.rssi);
    const seen = new Set<string>();
    const result: AccessPoint[] = [];

    // If the same SSID appears multiple times ignore those that sort lower (have lower RSSI).
    sorted.forEach(p => {
      if (!seen.has(p.ssid)) {
        seen.add(p.ssid);
        result.push(p);
      }
    });

    return result;
  }

  select(point: AccessPoint): void {
    if (this.isDisabled(point.authmode)) {
      // Do nothing. Previously `isDisabled` was used to set the button, corresponding
      // to this access point, to disabled but this made the button look more
      // highlighted than disabled. Now just the red lock icon is all that flags up
      // these "problem" access points.
    } else if (point.authmode === AuthMode.OPEN) {
      this.openConnect(point);
    } else {
      this.openAuthDialog(point);
    }
  }

  private openAuthDialog(point: AccessPoint): void {
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

    this.passwordConnect(point, password);
  }

  private openConnect(point: AccessPoint): void {
    const connect$ = this.accessPointsService.openConnect(point);

    this.connectSubscribe(connect$);
  }

  private passwordConnect(point: AccessPoint, password: string): void {
    const connect$ = this.accessPointsService.passwordConnect(point, password);

    this.connectSubscribe(connect$);
  }

  private connectSubscribe(connect$: Observable<ConnectResponse>): void {
    this.spinnerService.show()
    connect$.pipe(
        finalize(() => this.spinnerService.hide())
    ).subscribe(response => {
      console.log('Connect response (at component level):', response);
      this.openResultDialog(response);
    });
  }

  bars(rssi: number): number {
    // This RSSI to bars mapping is a bit arbitrary and derived from comparing
    // RSSI values reported by an ESP32 and the bars shown on my phone.
    if (rssi > -70) return 4;
    else if (rssi > -80) return 3;
    else if (rssi > -90) return 2;
    else if (rssi > -100) return 1;
    else return 0;
  }

  isProtected(authmode: AuthMode): boolean {
    return authmode !== AuthMode.OPEN;
  }

  lockColor(authmode: AuthMode): string {
    return this.isDisabled(authmode) ? 'warn' : 'basic';
  }

  isDisabled(authmode: AuthMode): boolean {
    // Currently ENTERPRISE isn't supported.
    return authmode === AuthMode.ENTERPRISE;
  }
}
