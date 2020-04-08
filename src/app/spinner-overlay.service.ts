import { Injectable } from '@angular/core';
import { Overlay, OverlayRef, OverlayConfig } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { MatSpinner } from '@angular/material/progress-spinner';

@Injectable({
  providedIn: 'root'
})
export class SpinnerOverlayService {
  private overlayRef: OverlayRef;
  private portal = new ComponentPortal(MatSpinner);

  constructor(overlay: Overlay) {
    this.overlayRef = overlay.create(this.config(overlay));
  }

  public show() {
    if (!this.overlayRef.hasAttached()) {
      this.overlayRef.attach(this.portal);
    }
  }

  public hide() {
    if (this.overlayRef.hasAttached()) {
      this.overlayRef.detach();
    }
  }

  private config(overlay: Overlay): OverlayConfig {
    // Note: scrollStrategies.block() only works if the backdrop is already scollable.
    // See https://github.com/angular/components/issues/19020

    return {
      hasBackdrop: true,
      scrollStrategy: overlay.scrollStrategies.block(),
      positionStrategy: overlay.position()
        .global()
        .centerHorizontally()
        .centerVertically()
    };
  }
}