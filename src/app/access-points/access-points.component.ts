import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-access-points',
  templateUrl: './access-points.component.html',
  styles: []
})
export class AccessPointsComponent implements OnInit {
  points: string[][] = [
    [ 'Alpha', '0123' ],
    [ 'Beta', '4567' ],
    [ 'Gamma', '89ab' ]
  ];

  constructor() { }

  ngOnInit(): void {
  }

  connect(point: string[]): void {
    console.log('Selected', point);
  }
}
