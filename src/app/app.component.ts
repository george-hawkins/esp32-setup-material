import { Component, OnInit } from '@angular/core';
import { AliveService } from './alive.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  alive = true;

  constructor(private aliveService: AliveService) { }

  ngOnInit(): void {
    this.aliveService.alive$.subscribe(alive => this.alive = alive);
  }
}
