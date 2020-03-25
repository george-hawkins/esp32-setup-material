import { Injectable } from '@angular/core';

import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';

import { Observable, of } from 'rxjs';
import { catchError, tap, map } from 'rxjs/operators';

import { AccessPoint } from './AccessPoint';
import { ConnectResponse, ConnectStatus } from './ConnectResponse';

const FORBIDDEN = 403;

@Injectable({
  providedIn: 'root'
})
export class AccessPointsService {
  private accessPointsUrl = '/api/access-points';
  private connectUrl = '/api/access-point';
  private aliveUrl = '/api/alive';

  constructor(private http: HttpClient) { }

  connect(point: AccessPoint, password: string): Observable<ConnectResponse> {
    const params = new HttpParams().set('bssid', point.bssid).set('password', password)
    return this.http.post<any>(this.connectUrl, params).pipe(
      tap(response => console.log('Connect response:', response)),
      map(response => new ConnectResponse(point, ConnectStatus.SUCCESS, response.message)),
      catchError(error => this.connectError(point, error))
    );
  }

  private connectError(point: AccessPoint, error: any): Observable<ConnectResponse> {
    if (error.status == FORBIDDEN) {
      return of(new ConnectResponse(point, ConnectStatus.FAILURE));
    } else {
      // Depending on the level at which the error was generated HttpErrorResponse.error may
      // contain more useful information than HttpErrorResponse.message. However message is
      // always a string whereas message may be anything, e.g. a plain string or structured data.
      const response = new ConnectResponse(point, ConnectStatus.UNEXPECTED_FAILURE, error.message);

      return this.handleError<ConnectResponse>('connect', response)(error)
    }
  }

  getAccessPoints(): Observable<AccessPoint[]> {
    return this.http.get<string[][]>(this.accessPointsUrl)
      .pipe(
        map(points => points.map(p => new AccessPoint(p[0], p[1]))),
        tap(points => console.log(`Retrieved ${points.length} access points.`)),
        catchError(this.handleError<AccessPoint[]>('getAccessPoints', []))
      )
  }

  keepAlive(millis: number): Observable<boolean> {
    const params = new HttpParams().set('timeout', millis.toString())
    return this.http.post<any>(this.aliveUrl, params).pipe(
      // Unlike the other calls, there's no response body and so nothing to log with `tap`.
      map(_0 => true),
      catchError(this.handleError<boolean>('keepAlive', false))
    );
  }

  private handleError<T>(operation: string, result?: T) {
    return (error: any): Observable<T> => {
      console.error(`${operation} error details`, error);

      // Let the app keep running by returning a defined canned result.
      return of(result as T);
    };
  }
}
