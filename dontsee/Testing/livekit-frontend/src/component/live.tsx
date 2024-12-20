import React, { useRef, useState, useEffect } from "react";

const ScreenRecorderWithCameraAudio = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [videoURL, setVideoURL] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const screenStreamRef = useRef<MediaStream | null>(null);
  const webcamStreamRef = useRef<MediaStream | null>(null);
  const combinedStreamRef = useRef<MediaStream | null>(null);
  const screenVideoRef = useRef<HTMLVideoElement | null>(null);
  const webcamVideoRef = useRef<HTMLVideoElement | null>(null);

  const startRecording = async () => {
    try {
      // Capture screen
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true, // Includes system audio if available
      });

      // Capture webcam
      const webcamStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true, // Includes microphone audio
      });

      screenStreamRef.current = screenStream;
      webcamStreamRef.current = webcamStream;

      // Display screen stream for live preview
      if (screenVideoRef.current) {
        screenVideoRef.current.srcObject = screenStream;
      }

      // Display webcam stream for live preview
      if (webcamVideoRef.current) {
        webcamVideoRef.current.srcObject = webcamStream;
      }

      // Combine all tracks (screen + webcam + audio)
      const combinedStream = new MediaStream([
        ...screenStream.getTracks(),
        ...webcamStream.getTracks(),
      ]);
      combinedStreamRef.current = combinedStream;

      // Initialize MediaRecorder
      chunksRef.current = [];
      const mediaRecorder = new MediaRecorder(combinedStream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "video/webm" });
        const url = URL.createObjectURL(blob);
        setVideoURL(url);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Error starting recording:", error);
    }
  };

  const stopRecording = () => {
    // Stop recording
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
    }

    // Stop all streams
    screenStreamRef.current?.getTracks().forEach((track) => track.stop());
    webcamStreamRef.current?.getTracks().forEach((track) => track.stop());
    combinedStreamRef.current?.getTracks().forEach((track) => track.stop());

    // Clean up refs
    screenStreamRef.current = null;
    webcamStreamRef.current = null;
    combinedStreamRef.current = null;

    setIsRecording(false);
  };

  return (
    <div style={{ padding: "20px", textAlign: "center" }}>
      <h1>Screen Recorder with Camera and Audio</h1>
      {isRecording ? (
        <div
          style={{
            position: "relative",
            display: "inline-block",
            width: "80%",
            marginBottom: "20px",
          }}
        >
          <video
            ref={screenVideoRef}
            autoPlay
            muted
            style={{
              width: "100%",
              border: "1px solid #ccc",
              borderRadius: "10px",
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: "20px",
              right: "20px",
              width: "150px",
              height: "150px",
              borderRadius: "50%",
              overflow: "hidden",
              border: "4px solid #fff",
              boxShadow: "0 0 10px rgba(0,0,0,0.5)",
            }}
          >
            <video
              ref={webcamVideoRef}
              autoPlay
              muted
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
          </div>
        </div>
      ) : (
        videoURL && (
          <div>
            <h3>Recorded Video:</h3>
            <video src={videoURL} controls style={{ width: "80%" }} />
            <div>
              <a href={videoURL} download="screen-recording-with-camera.webm">
                <button style={{ marginTop: "10px", padding: "10px 20px" }}>
                  Download
                </button>
              </a>
            </div>
          </div>
        )
      )}

      <div>
        {!isRecording ? (
          <button
            onClick={startRecording}
            style={{ marginRight: "10px", padding: "10px 20px" }}
          >
            Start Recording
          </button>
        ) : (
          <button onClick={stopRecording} style={{ padding: "10px 20px" }}>
            Stop Recording
          </button>
        )}
      </div>
    </div>
  );
};

export default ScreenRecorderWithCameraAudio;
