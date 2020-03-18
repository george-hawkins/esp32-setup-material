import { Injectable } from '@angular/core';

import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AccessPointsService {
  private accessPointsUrl = '/api/access-points';

  constructor(private http: HttpClient) { }

  getAccessPoints(): Observable<string[][]> {
    return this.http.get<string[][]>(this.accessPointsUrl)
      .pipe(
        tap(_ => console.log('Retrieved access points.')),
        catchError(this.handleError<string[][]>('getAccessPoints', []))
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
