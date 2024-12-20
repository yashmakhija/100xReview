import { useState, useCallback, useRef, useEffect } from "react";
import {
  StreamManager,
  createMediaStream,
  createDisplayStream,
} from "../utils/streamManager";
import { MediaRecorderManager } from "../utils/recorder";

interface MediaState {
  webcamStream: MediaStream | null;
  screenStream: MediaStream | null;
  audioStream: MediaStream | null;
  isWebcamActive: boolean;
  isScreenActive: boolean;
  isAudioActive: boolean;
  isFullScreen: boolean;
  isRecording: boolean;
  recordedChunks: Blob[];
  error: string | null;
}

export function useMediaDevices() {
  const [state, setState] = useState<MediaState>({
    webcamStream: null,
    screenStream: null,
    audioStream: null,
    isWebcamActive: false,
    isScreenActive: false,
    isAudioActive: false,
    isFullScreen: false,
    isRecording: false,
    recordedChunks: [],
    error: null,
  });

  const streamManagerRef = useRef(new StreamManager());
  const recorderManagerRef = useRef<MediaRecorderManager | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      streamManagerRef.current.cleanup();
      if (recorderManagerRef.current) {
        recorderManagerRef.current.stopRecording();
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  const startWebcam = useCallback(async () => {
    try {
      const stream = await createMediaStream({
        video: {
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          frameRate: { ideal: 30 },
        },
        audio: false,
      });

      setState((prev) => ({
        ...prev,
        webcamStream: stream,
        isWebcamActive: true,
        error: null,
      }));
    } catch (error) {
      setState((prev) => ({ ...prev, error: "Failed to start webcam" }));
    }
  }, []);

  const stopWebcam = useCallback(() => {
    setState((prev) => {
      if (prev.webcamStream) {
        prev.webcamStream.getTracks().forEach((track) => track.stop());
      }
      return {
        ...prev,
        webcamStream: null,
        isWebcamActive: false,
      };
    });
  }, []);

  const startScreenShare = useCallback(async () => {
    try {
      const stream = await createDisplayStream();

      stream.getVideoTracks()[0].addEventListener("ended", () => {
        setState((prev) => ({
          ...prev,
          screenStream: null,
          isScreenActive: false,
        }));
      });

      setState((prev) => ({
        ...prev,
        screenStream: stream,
        isScreenActive: true,
        error: null,
      }));
    } catch (error) {
      setState((prev) => ({ ...prev, error: "Failed to start screen share" }));
    }
  }, []);

  const stopScreenShare = useCallback(() => {
    setState((prev) => {
      if (prev.screenStream) {
        prev.screenStream.getTracks().forEach((track) => track.stop());
      }
      return {
        ...prev,
        screenStream: null,
        isScreenActive: false,
      };
    });
  }, []);

  const startAudio = useCallback(async () => {
    try {
      const stream = await createMediaStream({ audio: true, video: false });
      setState((prev) => ({
        ...prev,
        audioStream: stream,
        isAudioActive: true,
        error: null,
      }));
    } catch (error) {
      setState((prev) => ({ ...prev, error: "Failed to start audio" }));
    }
  }, []);

  const stopAudio = useCallback(() => {
    setState((prev) => {
      if (prev.audioStream) {
        prev.audioStream.getTracks().forEach((track) => track.stop());
      }
      return {
        ...prev,
        audioStream: null,
        isAudioActive: false,
      };
    });
  }, []);

  const toggleWebcam = useCallback(() => {
    if (state.isWebcamActive) {
      stopWebcam();
    } else {
      startWebcam();
    }
  }, [state.isWebcamActive, startWebcam, stopWebcam]);

  const toggleScreenShare = useCallback(() => {
    if (state.isScreenActive) {
      stopScreenShare();
    } else {
      startScreenShare();
    }
  }, [state.isScreenActive, startScreenShare, stopScreenShare]);

  const toggleAudio = useCallback(() => {
    if (state.isAudioActive) {
      stopAudio();
    } else {
      startAudio();
    }
  }, [state.isAudioActive, startAudio, stopAudio]);

  const toggleFullScreen = useCallback(() => {
    if (!containerRef.current) return;

    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch((err) => {
        console.error(
          `Error attempting to enable full-screen mode: ${err.message}`
        );
      });
    } else {
      document.exitFullscreen();
    }
    setState((prev) => ({ ...prev, isFullScreen: !prev.isFullScreen }));
  }, []);

  const drawFrame = useCallback(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (state.screenStream) {
      const screenVideo = streamManagerRef.current.getVideoElement(
        state.screenStream,
        "screen"
      );
      ctx.drawImage(screenVideo, 0, 0, canvas.width, canvas.height);
    }

    if (state.webcamStream) {
      const webcamVideo = streamManagerRef.current.getVideoElement(
        state.webcamStream,
        "webcam"
      );
      if (state.screenStream) {
        // Always show webcam in corner when screen sharing
        const webcamWidth = canvas.width / 4;
        const webcamHeight = (webcamWidth * 9) / 16;
        const x = canvas.width - webcamWidth - 20;
        const y = canvas.height - webcamHeight - 20;

        ctx.save();
        ctx.beginPath();
        ctx.roundRect(x, y, webcamWidth, webcamHeight, 8);
        ctx.clip();
        ctx.drawImage(webcamVideo, x, y, webcamWidth, webcamHeight);
        ctx.restore();

        ctx.strokeStyle = "white";
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, webcamWidth, webcamHeight);
      } else {
        // Full screen webcam when no screen sharing
        ctx.drawImage(webcamVideo, 0, 0, canvas.width, canvas.height);
      }
    }

    animationFrameRef.current = requestAnimationFrame(drawFrame);
  }, [state.screenStream, state.webcamStream]);

  const startRecording = useCallback(() => {
    if (!canvasRef.current) return;

    try {
      const canvas = canvasRef.current;

      drawFrame();

      const canvasStream = canvas.captureStream(30);

      if (state.screenStream) {
        state.screenStream.getAudioTracks().forEach((track) => {
          canvasStream.addTrack(track);
        });
      }
      if (state.audioStream) {
        state.audioStream.getAudioTracks().forEach((track) => {
          canvasStream.addTrack(track);
        });
      }

      recorderManagerRef.current = new MediaRecorderManager((chunks) => {
        setState((prev) => ({ ...prev, recordedChunks: chunks }));
      });

      recorderManagerRef.current.startRecording(canvasStream);
      setState((prev) => ({ ...prev, isRecording: true }));
    } catch (error) {
      console.error("Failed to start recording:", error);
      setState((prev) => ({ ...prev, error: "Failed to start recording" }));
    }
  }, [state.screenStream, state.audioStream, drawFrame]);

  const stopRecording = useCallback(() => {
    if (recorderManagerRef.current) {
      recorderManagerRef.current.stopRecording();
      setState((prev) => ({ ...prev, isRecording: false }));
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
  }, []);

  return {
    ...state,
    canvasRef,
    containerRef,
    toggleWebcam,
    toggleScreenShare,
    toggleAudio,
    toggleFullScreen,
    startRecording,
    stopRecording,
  };
}
