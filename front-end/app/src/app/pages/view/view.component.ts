import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {MatIcon} from '@angular/material/icon';
import {Stream} from '../../models/response.model';
import {DatePipe, NgIf} from '@angular/common';
import {EMPTY, Subject, switchMap, takeUntil} from 'rxjs';
import {StreamService} from '../../services/stream.service';
import {HttpErrorResponse} from '@angular/common/http';

@Component({
  selector: 'app-view',
  standalone: true,
  imports: [
    MatIcon,
    NgIf,
    DatePipe
  ],
  templateUrl: './view.component.html',
  styleUrl: './view.component.scss'
})
export class ViewComponent implements OnInit {
  @ViewChild('canvas') canvas!: ElementRef<HTMLCanvasElement>;
  private part: number = 0;
  public stream?: Stream;

  public loading: boolean = true;
  private destroy$ = new Subject<void>();
  private currentPlayer!: HTMLVideoElement;
  public isEnded = true;
  public isPlaying = false;
  private currentFrame?: number;

  constructor(
    private readonly streamService: StreamService,
  ) {}

  public play(): void {
    this.currentPlayer?.play();
    this.isPlaying = true;
  }

  public stop(): void {
    this.currentPlayer?.pause();
    this.isPlaying = false;
  }

  private isVideoPlaying(video: HTMLVideoElement): boolean {
    return (video.currentTime > 0 && !video.paused && !video.ended && video.readyState > 2);
  }

  public ngOnInit(): void {
    this.streamService.getStream()
      .pipe(
        switchMap(stream => {
          if (stream.endPoint <= 0) return EMPTY;
          this.part = stream.endPoint;
          this.stream = stream.data;

          return this.getFrame(this.part)
        }),
        takeUntil(this.destroy$)
      )
      .subscribe(this.processFrame(this.part))
  }

  private processFrame(part?: number, video?: HTMLVideoElement, ctx?: CanvasRenderingContext2D) {
    return {
      next: (buffer: ArrayBuffer)=> {
        const blob = new Blob([buffer]);
        const blobUrl = URL.createObjectURL(blob);

        if (!video) {
          this.playVideo(blobUrl);
        } else {
          this.part = part!;
          video.src = blobUrl;
          this.playSource(video, ctx!);
        }
      },
      error: this.errorCatcher.bind(this, video, ctx),
    }
  }

  private errorCatcher(video: HTMLVideoElement | undefined, ctx: CanvasRenderingContext2D | undefined, error: HttpErrorResponse) {
    if (error.status === 404) {
      window.setTimeout(() => {
        const urlPart = new URL(error.url!).searchParams.get('part');
        this.getFrame(+urlPart!)
          .subscribe(this.processFrame(+urlPart!, video, ctx))}
          , 1000);
    }

    if (error.status === 405) {
      this.isEnded = true;
      this.stream = undefined;
    }
  }

  private getFrame(part?: number) {
    return this.streamService
      .getFrame(part)
      .pipe(takeUntil(this.destroy$))
  }


  private async playVideo(blobUrl: string): Promise<void> {
    const video = document.createElement('video');
    video.src = blobUrl;

    const ctx = this.canvas.nativeElement?.getContext('2d');

    video.addEventListener('loadeddata', async() => {
      this.loading = false;
      this.currentPlayer = video;
      try {
        await video.play();
      } catch (e) {}

      this.update(ctx!, video)
    });

    this.playSource(video, ctx!)
  }

  private update(ctx: CanvasRenderingContext2D, video: HTMLVideoElement): void {
    ctx.drawImage(video, 0, 0, 640, 480);
    this.currentFrame = requestAnimationFrame(this.update.bind(this, ctx, video));
  }

  private index = 0;
  private async playSource(video: HTMLVideoElement, ctx: CanvasRenderingContext2D) {
    const nextVideo = document.createElement('video');
    this.index++;
    nextVideo.setAttribute('pert', this.index.toString());

    let playedNext = false;

    video.addEventListener('timeupdate', async() => {
      console.log(video.currentTime, video.getAttribute('pert'));
      if(video.currentTime > video.duration - 3 && !playedNext) {
        playedNext = true;
        this.streamService.getFrame(this.part + 1)
          .subscribe(this.processFrame(this.part + 1, nextVideo, ctx))
      }
    });

    video.addEventListener('ended', () => {
      if (!this.isVideoPlaying(nextVideo)) {
        this.loading = isNaN(nextVideo.duration);
        console.log('ended')
        this.currentPlayer = nextVideo;
        nextVideo.play();
        cancelAnimationFrame(this.currentFrame!);
        this.update(ctx!, nextVideo);
      }
      video.remove();
    });

    nextVideo.addEventListener('loadeddata', () => {
      this.loading = false;
      console.log('loadeddata')
      if(!this.isVideoPlaying(video)) {
        this.currentPlayer = nextVideo;
        nextVideo.play();
        cancelAnimationFrame(this.currentFrame!);
        this.update(ctx!, nextVideo);
      }
    });
  }
}
