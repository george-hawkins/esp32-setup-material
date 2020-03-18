import { Injectable } from '@angular/core';

import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Observable, of } from 'rxjs';
import { catchError, tap, map } from 'rxjs/operators';

import { AccessPoint } from './AccessPoint';

@Injectable({
  providedIn: 'root'
})
export class AccessPointsService {
  private accessPointsUrl = '/api/access-points';

  constructor(private http: HttpClient) { }

  getAccessPoints(): Observable<AccessPoint[]> {
    return this.http.get<string[][]>(this.accessPointsUrl)
      .pipe(
        map(points => points.map(p => new AccessPoint(p[0], p[1]))),
        tap(points => console.log(`Retrieved ${points.length} access points.`)),
        catchError(this.handleError<AccessPoint[]>('getAccessPoints', []))
      )
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(`${operation} failed: ${error.message}`)
      console.error('Error details:', error);

      // Let the app keep running by returning an empty result.
      return of(result as T);
    };
  }
}
