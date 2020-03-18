import { Component, OnInit } from '@angular/core';

import { AccessPointsService } from '../access-points.service';
import { AccessPoint } from '../AccessPoint';

@Component({
  selector: 'app-access-points',
  templateUrl: './access-points.component.html',
  styles: []
})
export class AccessPointsComponent implements OnInit {
  points: AccessPoint[];

  constructor(private accessPointsService: AccessPointsService) { }

  ngOnInit(): void {
    this.getAccessPoints();
  }

  connect(point: AccessPoint): void {
    console.log('Selected', point);
  }

  getAccessPoints(): void {
    // Subscribe for access points and sort them by SSID when received.
    this.accessPointsService.getAccessPoints()
      .subscribe(points => this.points = points.sort((a, b) => a.ssid.localeCompare(b.ssid)));
  }
}
