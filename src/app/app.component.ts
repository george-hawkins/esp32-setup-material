import { Component, OnInit } from '@angular/core';
import { IconService } from './icon.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent implements OnInit {
  constructor(private iconService: IconService) { }

  ngOnInit(): void {
    this.iconService.registerIcons();
  }
}
