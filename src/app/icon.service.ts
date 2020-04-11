import { Injectable } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';

@Injectable({
  providedIn: 'root'
})
export class IconService {
  private readonly LOCATION = '../assets/svg/icons';
  private readonly ICON_NAMES = [
    'ic_signal_wifi_0_bar_24px',
    'ic_signal_wifi_1_bar_24px',
    'ic_signal_wifi_2_bar_24px',
    'ic_signal_wifi_3_bar_24px',
    'ic_signal_wifi_4_bar_24px'
  ];

  constructor(
    private matIconRegistry: MatIconRegistry,
    private domSanitizer: DomSanitizer
  ) { }

  registerIcons(): void {
    this.ICON_NAMES.forEach(key => {
      const url = this.domSanitizer.bypassSecurityTrustResourceUrl(`${this.LOCATION}/${key}.svg`);
      this.matIconRegistry.addSvgIcon(key, url);
    });
  }
}
