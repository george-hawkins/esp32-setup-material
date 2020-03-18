import { Injectable } from '@angular/core';

import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AccessPointsService {
  private accessPointsUrl = '/api/access-points';

  constructor(private http: HttpClient) { }

  getAccessPoints(): Observable<string[][]> {
    return this.http.get<string[][]>(this.accessPointsUrl)
  }
}
