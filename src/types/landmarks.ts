export interface RawLandmark {
  x: number;
  y: number;
  z: number;
  visibility: number;
}

export interface HandData {
  landmarks: RawLandmark[];
  handedness: string;
  confidence: number;
}

export interface SmoothedHand extends HandData {
  smoothed: boolean;
}
