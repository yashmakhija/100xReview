import { useState, useRef, useCallback, useEffect } from "react";
import {
  getWebcamStream,
  getScreenStream,
  stopMediaStream,
  createRecordingStream,
} from "../utils/mediaUtils";

interface MediaState {
  webcam: MediaStream | null;
  screen: MediaStream | null;
}

export function useScreenRecorder() {
  const [mediaState, setMediaState] = useState<MediaState>({
    webcam: null,
    screen: null,
  });
  const [isRecording, setIsRecording] = useState(false);
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const recordingStreamRef = useRef<MediaStream | null>(null);

  const toggleWebcam = useCallback(async () => {
    try {
      if (mediaState.webcam) {
        stopMediaStream(mediaState.webcam);
        setMediaState((prev) => ({ ...prev, webcam: null }));
      } else {
        const stream = await getWebcamStream();
        setMediaState((prev) => ({ ...prev, webcam: stream }));
      }
    } catch (err) {
      setError("Failed to toggle webcam");
      console.error(err);
    }
  }, [mediaState.webcam]);

  const toggleScreenShare = useCallback(async () => {
    try {
      if (mediaState.screen) {
        stopMediaStream(mediaState.screen);
        setMediaState((prev) => ({ ...prev, screen: null }));
      } else {
        const stream = await getScreenStream();

        // Handle stream stop event
        stream.getVideoTracks()[0].addEventListener("ended", () => {
          setMediaState((prev) => ({ ...prev, screen: null }));
        });

        setMediaState((prev) => ({ ...prev, screen: stream }));
      }
    } catch (err) {
      setError("Failed to toggle screen share");
      console.error(err);
    }
  }, [mediaState.screen]);

  const startRecording = useCallback(() => {
    if (!canvasRef.current) return;

    try {
      // Create a new recording stream
      const stream = createRecordingStream(
        mediaState.screen,
        mediaState.webcam,
        canvasRef.current
      );

      recordingStreamRef.current = stream;

      // Create and configure MediaRecorder
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: "video/webm;codecs=vp9",
        videoBitsPerSecond: 3000000, // 3 Mbps
      });

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          setRecordedChunks((chunks) => [...chunks, event.data]);
        }
      };

      mediaRecorder.start(1000); // Collect data every second
      mediaRecorderRef.current = mediaRecorder;
      setIsRecording(true);
    } catch (err) {
      setError("Failed to start recording");
      console.error(err);
    }
  }, [mediaState.screen, mediaState.webcam]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);

      if (recordingStreamRef.current) {
        recordingStreamRef.current.getTracks().forEach((track) => track.stop());
        recordingStreamRef.current = null;
      }
    }
  }, [isRecording]);

  const downloadRecording = useCallback(() => {
    if (recordedChunks.length === 0) return;

    try {
      const blob = new Blob(recordedChunks, { type: "video/webm" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `recording-${new Date().toISOString()}.webm`;
      a.click();
      URL.revokeObjectURL(url);
      setRecordedChunks([]);
    } catch (err) {
      setError("Failed to download recording");
      console.error(err);
    }
  }, [recordedChunks]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopMediaStream(mediaState.webcam);
      stopMediaStream(mediaState.screen);
      if (recordingStreamRef.current) {
        stopMediaStream(recordingStreamRef.current);
      }
    };
  }, [mediaState]);

  return {
    mediaState,
    isRecording,
    hasRecording: recordedChunks.length > 0,
    error,
    canvasRef,
    toggleWebcam,
    toggleScreenShare,
    startRecording,
    stopRecording,
    downloadRecording,
  };
}
