import { NgModule } from '@angular/core';

import { HttpClientModule }    from '@angular/common/http';

import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';

import { AppComponent } from './app.component';
import { AccessPointsComponent } from './access-points/access-points.component';
import { AuthDialogComponent } from './auth-dialog/auth-dialog.component';

@NgModule({
  declarations: [
    AppComponent,
    AccessPointsComponent,
    AuthDialogComponent
  ],
  imports: [
    HttpClientModule,
    BrowserModule,
    BrowserAnimationsModule,
    MatToolbarModule,
    MatListModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
