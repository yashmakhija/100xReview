import React, { useState, useRef, useCallback, useEffect } from "react";
import { Camera, Monitor, Video, VideoOff, Mic, MicOff } from "lucide-react";

interface ScreenRecorderProps {
  onRecordingComplete?: (blob: Blob) => void;
  maxRecordingDuration?: number;
}

const   ScreenRecorder: React.FC<ScreenRecorderProps> = ({
  onRecordingComplete,
  maxRecordingDuration = 15 * 60 * 1000, // 15 minutes default
}) => {
  // State management
  const [isWebcamActive, setIsWebcamActive] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioDevices, setAudioDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedAudioDevice, setSelectedAudioDevice] = useState<string>("");

  // Refs for media elements
  const webcamVideoRef = useRef<HTMLVideoElement>(null);
  const screenVideoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Media stream refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const webcamStreamRef = useRef<MediaStream | null>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);
  const audioStreamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Clean up a specific stream
  const cleanupStream = (
    streamRef: React.MutableRefObject<MediaStream | null>
  ) => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  // Initialize canvas
  const initCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = 1280;
      canvas.height = 720;
    }
  };

  // Draw frame to canvas
  const drawFrame = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");

    if (!canvas || !ctx) return;

    // Clear previous frame
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    try {
      // Draw screen share if active
      if (isScreenSharing && screenVideoRef.current) {
        ctx.drawImage(
          screenVideoRef.current,
          0,
          0,
          canvas.width,
          canvas.height
        );
      }

      // Draw webcam if active
      if (isWebcamActive && webcamVideoRef.current) {
        if (isScreenSharing) {
          // PiP mode when screen sharing
          const pipWidth = canvas.width / 4;
          const pipHeight = canvas.height / 4;
          ctx.drawImage(
            webcamVideoRef.current,
            canvas.width - pipWidth - 20,
            canvas.height - pipHeight - 20,
            pipWidth,
            pipHeight
          );
        } else {
          // Full screen webcam
          ctx.drawImage(
            webcamVideoRef.current,
            0,
            0,
            canvas.width,
            canvas.height
          );
        }
      }
    } catch (error) {
      console.error("Error drawing frame:", error);
    }

    // Request next frame
    animationFrameRef.current = requestAnimationFrame(drawFrame);
  }, [isScreenSharing, isWebcamActive]);

  // Start Webcam
  const startWebcam = async () => {
    try {
      // Clean up existing stream
      cleanupStream(webcamStreamRef);

      console.log("Requesting webcam access...");
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 30 },
        },
        audio: false,
      });

      console.log("Webcam stream obtained:", stream.getVideoTracks()[0].label);

      if (webcamVideoRef.current) {
        webcamVideoRef.current.srcObject = stream;
        await webcamVideoRef.current.play();
      }

      webcamStreamRef.current = stream;
      setIsWebcamActive(true);

      // Start or restart animation frame
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      drawFrame();
    } catch (error) {
      console.error("Webcam start error:", error);
      if (error instanceof DOMException && error.name === "NotAllowedError") {
        alert("Please allow camera access to use this feature.");
      } else {
        alert("Failed to start webcam. Please check your camera connection.");
      }
    }
  };

  // Start Screen Share
  const startScreenShare = async () => {
    try {
      // Clean up existing stream
      cleanupStream(screenStreamRef);

      console.log("Requesting screen share access...");
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          displaySurface: "monitor",
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          frameRate: { ideal: 30 },
        },
        audio: false,
      });

      console.log(
        "Screen share stream obtained:",
        stream.getVideoTracks()[0].label
      );

      if (screenVideoRef.current) {
        screenVideoRef.current.srcObject = stream;
        await screenVideoRef.current.play();
      }

      screenStreamRef.current = stream;
      setIsScreenSharing(true);

      // Handle stream end
      stream.getVideoTracks()[0].onended = () => {
        console.log("Screen share ended by user");
        stopScreenShare();
      };

      // Start or restart animation frame
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      drawFrame();
    } catch (error) {
      console.error("Screen share error:", error);
      if (error instanceof DOMException && error.name === "NotAllowedError") {
        alert("Please allow screen sharing to use this feature.");
      } else {
        alert("Failed to start screen sharing. Please try again.");
      }
    }
  };

  // Update audio state
  const toggleAudio = useCallback(async () => {
    try {
      if (audioStreamRef.current) {
        // Stop existing tracks
        audioStreamRef.current.getTracks().forEach(track => track.stop());
        audioStreamRef.current = null;
      }

      if (!isAudioEnabled) {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            deviceId: selectedAudioDevice ? { exact: selectedAudioDevice } : undefined,
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          }
        });
        audioStreamRef.current = stream;
        stream.getAudioTracks().forEach(track => {
          track.enabled = true;
        });
      }
      
      setIsAudioEnabled(!isAudioEnabled);
    } catch (error) {
      console.error("Error toggling audio:", error);
      if (error instanceof DOMException && error.name === "NotAllowedError") {
        alert("Please allow microphone access to use audio.");
      } else {
        alert("Failed to toggle audio. Please check your microphone connection.");
      }
    }
  }, [isAudioEnabled, selectedAudioDevice]);

  // Update captureAudio function
  const captureAudio = async () => {
    if (!isAudioEnabled) return null;

    try {
      if (audioStreamRef.current) {
        // Stop existing tracks
        audioStreamRef.current.getTracks().forEach(track => track.stop());
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          deviceId: selectedAudioDevice ? { exact: selectedAudioDevice } : undefined,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        }
      });
      
      audioStreamRef.current = stream;
      stream.getAudioTracks().forEach(track => {
        track.enabled = isAudioEnabled;
      });
      return stream;
    } catch (error) {
      console.error("Audio capture error:", error);
      alert("Failed to capture audio. Recording will be without sound.");
      return null;
    }
  };

  // Start Recording
  const startRecording = useCallback(async () => {
    try {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const tracks: MediaStreamTrack[] = [];

      // Add screen share track if active
      if (screenStreamRef.current) {
        const screenTrack = screenStreamRef.current.getVideoTracks()[0];
        if (screenTrack) {
          tracks.push(screenTrack.clone());
        }
      } else if (webcamStreamRef.current) {
        // If no screen share, use canvas stream for webcam-only recording
        const canvasStream = canvas.captureStream(30);
        const canvasTrack = canvasStream.getVideoTracks()[0];
        if (canvasTrack) {
          tracks.push(canvasTrack);
        }
      }

      // Add webcam track if active and screen sharing
      if (isWebcamActive && screenStreamRef.current) {
        const canvasStream = canvas.captureStream(30);
        const canvasTrack = canvasStream.getVideoTracks()[0];
        if (canvasTrack) {
          tracks.push(canvasTrack);
        }
      }

      // Get audio if enabled
      const audioStream = await captureAudio();
      if (audioStream) {
        const audioTrack = audioStream.getAudioTracks()[0];
        if (audioTrack) {
          tracks.push(audioTrack);
        }
      }

      // Create combined stream
      const combinedStream = new MediaStream(tracks);

      // Setup MediaRecorder with high quality options
      const recorder = new MediaRecorder(combinedStream, {
        mimeType: "video/webm;codecs=vp9",
        videoBitsPerSecond: 6000000, // Increased bitrate for better quality
      });

      chunksRef.current = [];
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        // Stop all cloned tracks
        combinedStream.getTracks().forEach((track) => track.stop());

        const blob = new Blob(chunksRef.current, {
          type: "video/webm",
        });

        if (blob.size > 0) {
          onRecordingComplete?.(blob);
        }

        // Clean up recording
        cleanupStream(audioStreamRef);
        setRecordingTime(0);
      };

      // Handle visibility change
      const handleVisibilityChange = () => {
        if (document.hidden) {
          console.log("Tab hidden - keeping recording active");
          // Keep streams active but pause animation
          if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
          }
        } else {
          console.log("Tab visible again - recording continues");
          // Resume animation
          if (isWebcamActive || isScreenSharing) {
            drawFrame();
          }
        }
      };

      // Add visibility change listener
      document.addEventListener("visibilitychange", handleVisibilityChange);

      // Start recording with smaller chunks for better reliability
      recorder.start(500); // Record in 500ms chunks
      mediaRecorderRef.current = recorder;
      setIsRecording(true);

      // Recording time tracking
      setRecordingTime(0);
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);

      // Auto-stop recording
      setTimeout(() => {
        if (isRecording) {
          stopRecording();
          document.removeEventListener(
            "visibilitychange",
            handleVisibilityChange
          );
        }
      }, maxRecordingDuration);

      // Keep drawing frames during recording for preview
      if (isWebcamActive || isScreenSharing) {
        drawFrame();
      }

      // Cleanup function
      return () => {
        document.removeEventListener(
          "visibilitychange",
          handleVisibilityChange
        );
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
      };
    } catch (error) {
      console.error("Recording start error:", error);
      alert("Failed to start recording. Please try again.");
    }
  }, [
    isAudioEnabled,
    onRecordingComplete,
    maxRecordingDuration,
    isRecording,
    isWebcamActive,
    isScreenSharing,
    drawFrame,
  ]);

  // Stop Recording with cleanup
  const stopRecording = useCallback(() => {
    try {
      if (
        mediaRecorderRef.current &&
        mediaRecorderRef.current.state !== "inactive"
      ) {
        mediaRecorderRef.current.stop();
        mediaRecorderRef.current = null;
      }

      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
        recordingIntervalRef.current = null;
      }

      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }

      setIsRecording(false);
    } catch (error) {
      console.error("Error stopping recording:", error);
    }
  }, []);

  // Stop Webcam
  const stopWebcam = () => {
    cleanupStream(webcamStreamRef);
    if (webcamVideoRef.current) {
      webcamVideoRef.current.srcObject = null;
    }
    setIsWebcamActive(false);
  };

  // Stop Screen Share
  const stopScreenShare = () => {
    cleanupStream(screenStreamRef);
    if (screenVideoRef.current) {
      screenVideoRef.current.srcObject = null;
    }
    setIsScreenSharing(false);
  };

  // Initialize canvas on mount
  useEffect(() => {
    initCanvas();
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      cleanupStream(webcamStreamRef);
      cleanupStream(screenStreamRef);
      cleanupStream(audioStreamRef);
    };
  }, []);

  // Update drawing when sources change
  useEffect(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    if (isWebcamActive || isScreenSharing) {
      drawFrame();
    }
  }, [isWebcamActive, isScreenSharing, drawFrame]);

  // Add this function to get available audio devices
  const getAudioDevices = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const audioInputs = devices.filter(device => device.kind === 'audioinput');
      setAudioDevices(audioInputs);
      
      // Set default device if available
      if (audioInputs.length > 0 && !selectedAudioDevice) {
        setSelectedAudioDevice(audioInputs[0].deviceId);
      }
    } catch (error) {
      console.error('Error getting audio devices:', error);
    }
  };

  // Add useEffect to get devices and listen for device changes
  useEffect(() => {
    getAudioDevices();

    // Listen for device changes
    navigator.mediaDevices.addEventListener('devicechange', getAudioDevices);

    return () => {
      navigator.mediaDevices.removeEventListener('devicechange', getAudioDevices);
    };
  }, []);

  const handleAudioDeviceChange = async (deviceId: string) => {
    setSelectedAudioDevice(deviceId);
    if (isAudioEnabled) {
      // Restart audio with new device
      await toggleAudio();
      await toggleAudio();
    }
  };

  return (
    <div className="rounded-lg p-4 max-w-md mx-auto bg-white shadow-md">
      <div className="relative bg-gray-100 rounded-lg mb-4 overflow-hidden aspect-video">
        {/* Hidden video elements */}
        <video
          ref={webcamVideoRef}
          autoPlay
          playsInline
          muted
          className="hidden"
        />
        <video
          ref={screenVideoRef}
          autoPlay
          playsInline
          muted
          className="hidden"
        />

        {/* Canvas for preview */}
        <canvas ref={canvasRef} className="w-full h-full object-contain" />

        {/* Fallback message */}
        {!isScreenSharing && !isWebcamActive && (
          <div className="absolute inset-0 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <p className="mb-2">No preview available</p>
              <p className="text-sm">
                Enable camera or screen sharing to start
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Audio Device Selector */}
      {audioDevices.length > 0 && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Microphone
          </label>
          <select
            value={selectedAudioDevice}
            onChange={(e) => handleAudioDeviceChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            disabled={isRecording}
          >
            {audioDevices.map((device) => (
              <option key={device.deviceId} value={device.deviceId}>
                {device.label || `Microphone ${device.deviceId.slice(0, 5)}...`}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Control Panel */}
      <div className="flex justify-between items-center bg-gray-100 rounded-lg p-2">
        {/* Webcam Toggle */}
        <button
          onClick={isWebcamActive ? stopWebcam : startWebcam}
          className={`p-2 rounded-full ${
            isWebcamActive
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-700"
          }`}
          title={isWebcamActive ? "Disable Webcam" : "Enable Webcam"}
        >
          <Camera size={20} />
        </button>

        {/* Screen Share Toggle */}
        <button
          onClick={isScreenSharing ? stopScreenShare : startScreenShare}
          className={`p-2 rounded-full ${
            isScreenSharing
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-700"
          }`}
          title={isScreenSharing ? "Stop Screen Share" : "Start Screen Share"}
        >
          <Monitor size={20} />
        </button>

        {/* Audio Toggle */}
        <button
          onClick={toggleAudio}
          className={`p-2 rounded-full ${
            isAudioEnabled
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-700"
          }`}
          title={isAudioEnabled ? "Mute Audio" : "Unmute Audio"}
        >
          {isAudioEnabled ? <Mic size={20} /> : <MicOff size={20} />}
        </button>

        {/* Record Toggle */}
        <button
          onClick={isRecording ? stopRecording : startRecording}
          className={`p-2 rounded-full ${
            isRecording ? "bg-red-600" : "bg-green-600"
          } text-white`}
          disabled={!isScreenSharing && !isWebcamActive}
          title={isRecording ? "Stop Recording" : "Start Recording"}
        >
          {isRecording ? <VideoOff size={20} /> : <Video size={20} />}
        </button>
      </div>

      {/* Recording Time */}
      {isRecording && (
        <div className="text-center text-red-500 mt-2">
          Recording: {formatTime(recordingTime)}
        </div>
      )}
    </div>
  );
};

// Helper function to format time
const formatTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
    .toString()
    .padStart(2, "0")}`;
};

export default ScreenRecorder;
