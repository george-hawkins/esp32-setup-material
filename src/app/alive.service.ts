import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AliveService {
  private alive = new Subject<boolean>();

  alive$ = this.alive.asObservable();

  nextAlive(alive: boolean): void {
    this.alive.next(alive);
  }
}
