import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl: string = 'http://localhost:4000';
  constructor(
    private readonly http: HttpClient,
  ) { }

  public post<Body, T>(url: string, body: Body): Observable<T> {
    return this.http.post<T>(`${this.baseUrl}/${url}`, body);
  }

  public put<Body, T>(url: string, body: Body): Observable<T> {
    return this.http.put<T>(`${this.baseUrl}/${url}`, body);
  }

  public patch<Body, T>(url: string, body: Body): Observable<T> {
    return this.http.patch<T>(`${this.baseUrl}/${url}`, body);
  }

  public get<T>(url: string, params?: HttpParams, responseType: any = 'json'): Observable<T> {
    return this.http.get(`${this.baseUrl}/${url}`, { params, responseType })
      .pipe(map(value => value as T));
  }
}
