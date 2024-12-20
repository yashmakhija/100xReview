export interface MediaStreamState {
  webcam: MediaStream | null;
  screen: MediaStream | null;
  audio: MediaStream | null;
}

export interface RecordingState {
  isRecording: boolean;
  recordedChunks: Blob[];
}

export interface ControlState {
  isWebcamOn: boolean;
  isScreenShareOn: boolean;
  isMicrophoneOn: boolean;
}
