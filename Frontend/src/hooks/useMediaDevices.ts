import { useState, useCallback } from "react";
import { useSetRecoilState } from "recoil";
import { errorState, recordedBlobState } from "../atoms/screenRecorderAtoms";

export const useMediaDevices = () => {
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(
    null
  );
  const setError = useSetRecoilState(errorState);
  const setRecordedBlob = useSetRecoilState(recordedBlobState);
  const chunks: Blob[] = [];

  const startWebcam = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          frameRate: { ideal: 30 },
        },
        audio: true,
      });
      return stream;
    } catch (err) {
      setError("Failed to access webcam");
      console.error("Error accessing webcam:", err);
      return null;
    }
  }, [setError]);

  const startScreenShare = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          frameRate: { ideal: 30 },
        },
        audio: true,
      });
      return stream;
    } catch (err) {
      setError("Failed to start screen sharing");
      console.error("Error starting screen share:", err);
      return null;
    }
  }, [setError]);

  const startRecording = useCallback(
    (stream: MediaStream) => {
      try {
        const recorder = new MediaRecorder(stream, {
          mimeType: "video/webm;codecs=vp9,opus",
        });

        recorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            chunks.push(event.data);
          }
        };

        recorder.onstop = () => {
          const blob = new Blob(chunks, { type: "video/webm" });
          setRecordedBlob(blob); // Set the recorded blob in Recoil state
          chunks.length = 0; // Clear the chunks array
          if (recorder.state !== "inactive") {
            recorder.stop();
          }
          setMediaRecorder(null);
        };

        recorder.start();
        setMediaRecorder(recorder);
        return recorder;
      } catch (err) {
        setError("Failed to start recording");
        console.error("Error starting recording:", err);
        return null;
      }
    },
    [setError, setRecordedBlob]
  );

  const stopRecording = useCallback((recorder: MediaRecorder) => {
    if (recorder && recorder.state !== "inactive") {
      recorder.stop();
    }
  }, []);

  return {
    startWebcam,
    startScreenShare,
    startRecording,
    stopRecording,
    mediaRecorder,
  };
};
