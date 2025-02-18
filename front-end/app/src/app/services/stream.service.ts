import { Injectable } from '@angular/core';
import {ApiService} from './api.service';
import {Observable} from 'rxjs';
import {FrameResponse, Stream, StreamResponse} from '../models/response.model';
import {HttpParams} from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class StreamService {
  private readonly baseUrl = 'stream';

  constructor(
    private readonly api: ApiService,
  ) { }

  public recordFrame(formData: FormData): Observable<FrameResponse> {
    return this.api.put<FormData, FrameResponse>(`${this.baseUrl}`, formData);
  }

  public getFrame(part?: number): Observable<ArrayBuffer> {
    let params: HttpParams | undefined;
    if (part) {
      params = new HttpParams({
        fromObject: {
          part
        }
      });
    }

    return this.api.get<ArrayBuffer>(`${this.baseUrl}/frame`, params, 'arraybuffer');
  }

  public createStream(streamData: Stream): Observable<Stream> {
    return this.api.post<Stream, Stream>(`${this.baseUrl}`, streamData);
  }

  public stopStream(): Observable<Stream> {
    return this.api.patch<undefined, Stream>(`${this.baseUrl}`, undefined)
  }

  public getStream(): Observable<StreamResponse> {
    return this.api.get<StreamResponse>(`${this.baseUrl}`);
  }
}
