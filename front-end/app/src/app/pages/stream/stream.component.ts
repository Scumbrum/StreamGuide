import {Component, OnInit} from '@angular/core';
import {MatFormField, MatFormFieldModule} from '@angular/material/form-field';
import {MatInput} from '@angular/material/input';
import {MatButton} from '@angular/material/button';
import {Subject, take} from 'rxjs';
import {Stream} from '../../models/response.model';
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {StreamService} from '../../services/stream.service';
import {HttpErrorResponse} from '@angular/common/http';
import {DatePipe, NgIf} from '@angular/common';

@Component({
  selector: 'app-stream',
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatInput,
    MatButton,
    ReactiveFormsModule,
    NgIf,
    DatePipe
  ],
  templateUrl: './stream.component.html',
  styleUrl: './stream.component.scss'
})
export class StreamComponent implements OnInit {
  public stream!: MediaStream | null;
  private destroy$ = new Subject<void>();
  public showStartButton = false;
  private mediaConstraints = {
    audio: true,
    video: true
  }
  public streamData?: Stream;
  private mimeType = 'video/webm';
  public streamLive = false;
  public streamForm = new FormGroup({
    name: new FormControl('', [Validators.required]),
  })

  constructor(private streamService: StreamService) {}

  public async startRecording(): Promise<void> {
    this.showStartButton = false;
    this.stream = await navigator.mediaDevices.getDisplayMedia(this.mediaConstraints);

    this.stream?.getVideoTracks()[0].addEventListener('ended', () => this.showStartButton = true);
    this.recordFrame();
  }

  private async recordFrame(): Promise<void> {
    const mediaRecorder = new MediaRecorder(this.stream!, {mimeType: this.mimeType});
    mediaRecorder.start();

      this.dataHandler(mediaRecorder);

    setTimeout(() => {
      if(this.stream?.active) {
        this.recordFrame();
        mediaRecorder.stop();
      }
    }, 5000)
  }

  private dataHandler(mediaRecorder: MediaRecorder): void {
    try {
      mediaRecorder.ondataavailable = (event) => {
        if(event.data && event.data.size > 0) {
          const videoBuffer = new Blob([event.data], { type: this.mimeType });
          const file = new File([videoBuffer], 'mediaLiveFrame');
          let formData = new FormData();
          formData.append('file', file);
          if(this.streamLive) {
            this.streamService.recordFrame(formData)
              .pipe(take(1))
              .subscribe({
                error: this.endRecording.bind(this),
              })
          }
        }
      };
    } catch (e) {
      console.error(e)
    }
  }

  private endRecording(error: HttpErrorResponse): void {
    if (error.status === 405) {
      this.streamLive = false;
      this.stream?.getTracks().forEach(track => track.stop());
    }
  }

  public stopStream(): void {
    this.streamService.stopStream()
      .pipe(take(1))
      .subscribe(() => {
        this.streamLive = false;
        this.stream?.getTracks().forEach(track => track.stop());
        this.streamData = undefined;
      });
  }

  public createStream(): void {
    this.streamService.createStream({
      name: this.streamForm.value.name!,
      dateStart: new Date().toISOString(),
    })
      .pipe(take(1))
      .subscribe(data => {
        this.streamData = data;
        this.streamLive = true;
        this.startRecording();
      })
  }

  public ngOnInit(): void {
    this.streamService.getStream()
      .pipe(take(1))
      .subscribe(data => {
        this.streamData = data.data;
        this.streamLive = true;
        this.startRecording();
      })
  }
}
