import { Injectable } from '@angular/core';

import { HttpClient, HttpParams } from '@angular/common/http';

import { Observable, of } from 'rxjs';
import { catchError, tap, map } from 'rxjs/operators';

import { AccessPoint } from './AccessPoint';
import { ConnectResponse, ConnectStatus } from './ConnectResponse';

const ACCESS_POINT_URL = '/api/access-points';
const CONNECT_URL = '/api/access-point';
const ALIVE_URL = '/api/alive';

const FORBIDDEN = 403;

@Injectable({
  providedIn: 'root'
})
export class AccessPointsService {
  constructor(private http: HttpClient) { }

  openConnect(point: AccessPoint): Observable<ConnectResponse> {
    return this.connect(point);
  }

  passwordConnect(point: AccessPoint, password: string): Observable<ConnectResponse> {
    return this.connect(point, { 'password': password });
  }

  private connect(point: AccessPoint, extraParams: Record<string, string> = {}): Observable<ConnectResponse> {
    let params = new HttpParams().set('ssid', point.ssid);

    for (let key in extraParams) {
      params = params.set(key, extraParams[key]); // Each call to `set` returns a _new_ object.
    }

    return this.http.post<any>(CONNECT_URL, params).pipe(
      tap(response => console.log('Connect response:', response)),
      map(response => new ConnectResponse(point, ConnectStatus.SUCCESS, response.message)),
      catchError(error => this.connectError(point, error))
    );
  }

  private connectError(point: AccessPoint, error: any): Observable<ConnectResponse> {
    if (error.status === FORBIDDEN) {
      return of(new ConnectResponse(point, ConnectStatus.FAILURE));
    } else {
      // Depending on the level at which the error was generated HttpErrorResponse.error may
      // contain more useful information than HttpErrorResponse.message. However message is
      // always a string whereas message may be anything, e.g. a plain string or structured data.
      const response = new ConnectResponse(point, ConnectStatus.UNEXPECTED_FAILURE, error.message);

      return this.handleError<ConnectResponse>('connect', response)(error);
    }
  }

  getAccessPoints(): Observable<AccessPoint[]> {
    return this.http.get<string[][]>(ACCESS_POINT_URL)
      .pipe(
        map(points => points.map(p => new AccessPoint(p[0], Number(p[1]), Number(p[2])))),
        tap(points => console.log(`Retrieved ${points.length} access points.`)),
        catchError(this.handleError<AccessPoint[]>('getAccessPoints', []))
      );
      // Note that in the test setup half the received access points will be filtered out as duplicates.
  }

  keepAlive(seconds: number): Observable<boolean> {
    const params = new HttpParams().set('timeout', seconds.toString());

    return this.http.post<any>(ALIVE_URL, params).pipe(
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
