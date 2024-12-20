export interface RecordingState {
  isRecording: boolean;
  isPaused: boolean;
  duration: number;
}

export interface StreamState {
  webcam: MediaStream | null;
  screen: MediaStream | null;
  audio: boolean;
}

export interface VideoPreviewProps {
  url: string;
  duration: number;
}
