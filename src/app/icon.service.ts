import { Injectable } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';

@Injectable({
  providedIn: 'root'
})
export class IconService {
  private readonly LOCATION = '../assets/svg/icons.svg';

  constructor(
    private matIconRegistry: MatIconRegistry,
    private domSanitizer: DomSanitizer
  ) { }

  registerIcons(): void {
    const url = this.domSanitizer.bypassSecurityTrustResourceUrl(this.LOCATION);
    this.matIconRegistry.addSvgIconSet(url);
  }
}
