import { Component, OnInit } from '@angular/core';

import { MatDialog } from '@angular/material/dialog';

import { AccessPointsService } from '../access-points.service';
import { AccessPoint } from '../AccessPoint';
import { AuthDialogComponent } from '../auth-dialog/auth-dialog.component';

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

  openDialog(point: AccessPoint): void {
    let dialogRef = this.dialog.open(AuthDialogComponent, {
      width: '250px',
      data: point
    });

    dialogRef.afterClosed().subscribe(password => this.onClosed(point, password));
  }

  private onClosed(point: AccessPoint, password: string) {
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
      });
  }

  getAccessPoints(): void {
    // Subscribe for access points and sort them by SSID when received.
    // Nomally Android displays SSIDs sorted by RSSI but as of MicroPython 1.12 RSSI is not available for the ESP32 port.
    this.accessPointsService.getAccessPoints()
      .subscribe(points => this.points = points.sort((a, b) => a.ssid.localeCompare(b.ssid)));
  }
}
