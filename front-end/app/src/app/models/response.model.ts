export interface Stream {
  name: string;
  dateStart: string;
}

export interface FrameResponse {
  partNUmber: number;
}

export interface StreamResponse {
  data: Stream;
  endPoint: number
}
