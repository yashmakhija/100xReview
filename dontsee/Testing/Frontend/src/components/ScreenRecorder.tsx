import React, { useRef, useEffect } from "react";
import {
  Camera,
  Monitor,
  Video,
  VideoOff,
  Download,
  Mic,
  MicOff,
  Maximize,
  Minimize,
} from "lucide-react";
import { useMediaDevices } from "../hooks/useMediaDevices";
import { downloadRecording } from "../utils/recorder";

export default function ScreenRecorder() {
  const {
    webcamStream,
    screenStream,
    isWebcamActive,
    isScreenActive,
    isAudioActive,
    isFullScreen,
    isRecording,
    recordedChunks,
    error,
    canvasRef,
    containerRef,
    toggleWebcam,
    toggleScreenShare,
    toggleAudio,
    toggleFullScreen,
    startRecording,
    stopRecording,
  } = useMediaDevices();

  const screenVideoRef = useRef<HTMLVideoElement>(null);
  const webcamVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (screenVideoRef.current && screenStream) {
      screenVideoRef.current.srcObject = screenStream;
      screenVideoRef.current.play().catch((error) => {
        console.error("Error playing screen video:", error);
      });
    }
  }, [screenStream]);

  useEffect(() => {
    if (webcamVideoRef.current && webcamStream) {
      webcamVideoRef.current.srcObject = webcamStream;
      webcamVideoRef.current.play().catch((error) => {
        console.error("Error playing webcam video:", error);
      });
    }
  }, [webcamStream]);

  useEffect(() => {
    if (canvasRef.current) {
      canvasRef.current.width = 1920;
      canvasRef.current.height = 1080;
    }
  }, []);

  return (
    <div
      ref={containerRef}
      className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4"
    >
      <div className="relative w-[95vw] max-w-[1800px] aspect-video bg-black rounded-lg overflow-hidden shadow-2xl">
        {screenStream && (
          <video
            ref={screenVideoRef}
            className="absolute inset-0 w-full h-full object-contain"
            autoPlay
            playsInline
            muted
          />
        )}

        {webcamStream && (
          <div
            className={`${
              screenStream
                ? "absolute bottom-4 right-4 w-1/4"
                : "absolute inset-0"
            } aspect-video`}
          >
            <video
              ref={webcamVideoRef}
              className={`w-full h-full ${
                screenStream
                  ? "object-cover rounded-lg border-2 border-white"
                  : "object-contain"
              }`}
              autoPlay
              playsInline
              muted
            />
          </div>
        )}

        {!webcamStream && !screenStream && (
          <div className="absolute inset-0 flex items-center justify-center text-gray-500">
            <p className="text-xl">No active video sources</p>
          </div>
        )}

        <canvas ref={canvasRef} className="hidden" width={1920} height={1080} />
      </div>

      <div className="mt-6 flex items-center gap-6 flex-wrap justify-center">
        <button
          onClick={toggleWebcam}
          className={`p-4 rounded-full transition-colors ${
            isWebcamActive
              ? "bg-blue-500 hover:bg-blue-600"
              : "bg-gray-700 hover:bg-gray-600"
          }`}
          title="Toggle Webcam"
        >
          <Camera className="w-7 h-7" />
        </button>

        <button
          onClick={toggleScreenShare}
          className={`p-4 rounded-full transition-colors ${
            isScreenActive
              ? "bg-blue-500 hover:bg-blue-600"
              : "bg-gray-700 hover:bg-gray-600"
          }`}
          title="Toggle Screen Share"
        >
          <Monitor className="w-7 h-7" />
        </button>

        <button
          onClick={toggleAudio}
          className={`p-4 rounded-full transition-colors ${
            isAudioActive
              ? "bg-blue-500 hover:bg-blue-600"
              : "bg-gray-700 hover:bg-gray-600"
          }`}
          title="Toggle Microphone"
        >
          {isAudioActive ? (
            <Mic className="w-7 h-7" />
          ) : (
            <MicOff className="w-7 h-7" />
          )}
        </button>

        <button
          onClick={toggleFullScreen}
          className="p-4 rounded-full bg-gray-700 hover:bg-gray-600 transition-colors"
          title="Toggle Full Screen"
        >
          {isFullScreen ? (
            <Minimize className="w-7 h-7" />
          ) : (
            <Maximize className="w-7 h-7" />
          )}
        </button>

        <button
          onClick={isRecording ? stopRecording : startRecording}
          disabled={!isScreenActive && !isWebcamActive}
          className={`p-4 rounded-full transition-colors ${
            isRecording
              ? "bg-red-500 hover:bg-red-600"
              : "bg-green-500 hover:bg-green-600"
          } disabled:opacity-50 disabled:cursor-not-allowed`}
          title={isRecording ? "Stop Recording" : "Start Recording"}
        >
          {isRecording ? (
            <VideoOff className="w-7 h-7" />
          ) : (
            <Video className="w-7 h-7" />
          )}
        </button>
      </div>

      {!isRecording && recordedChunks.length > 0 && (
        <div className="mt-6">
          <button
            onClick={() => downloadRecording(recordedChunks)}
            className="px-6 py-3 bg-purple-500 hover:bg-purple-600 transition-colors rounded-lg flex items-center text-lg font-medium"
          >
            <Download className="w-6 h-6 mr-2" />
            Download Recording
          </button>
        </div>
      )}

      {error && (
        <div className="mt-6 px-6 py-3 bg-red-500 text-white rounded-lg">
          {error}
        </div>
      )}
    </div>
  );
}
