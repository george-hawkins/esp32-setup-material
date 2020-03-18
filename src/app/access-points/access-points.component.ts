import { Component, OnInit } from '@angular/core';
import { AccessPointsService } from '../access-points.service';

@Component({
  selector: 'app-access-points',
  templateUrl: './access-points.component.html',
  styles: []
})
export class AccessPointsComponent implements OnInit {
  points: string[][];

  constructor(private accessPointsService: AccessPointsService) { }

  ngOnInit(): void {
    this.getAccessPoints();
  }

  connect(point: string[]): void {
    console.log('Selected', point);
  }

  getAccessPoints(): void {
    this.accessPointsService.getAccessPoints()
      .subscribe(points => this.points = points);
  }
}
