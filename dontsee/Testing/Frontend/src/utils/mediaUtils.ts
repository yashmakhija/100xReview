export async function getWebcamStream(): Promise<MediaStream> {
  try {
    return await navigator.mediaDevices.getUserMedia({
      video: {
        width: { ideal: 1920 },
        height: { ideal: 1080 },
        frameRate: { ideal: 30 },
      },
      audio: true,
    });
  } catch (error) {
    console.error("Error accessing webcam:", error);
    throw new Error("Unable to access webcam");
  }
}

export async function getScreenStream(): Promise<MediaStream> {
  try {
    return await navigator.mediaDevices.getDisplayMedia({
      video: {
        displaySurface: "monitor",
        frameRate: { ideal: 30 },
      },
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
      },
    });
  } catch (error) {
    console.error("Error accessing screen:", error);
    throw new Error("Unable to access screen");
  }
}

export function stopMediaStream(stream: MediaStream | null) {
  if (stream) {
    stream.getTracks().forEach((track) => {
      track.stop();
    });
  }
}

function setupVideoElement(stream: MediaStream): HTMLVideoElement {
  const video = document.createElement("video");
  video.srcObject = stream;
  video.muted = true;
  video.play();
  return video;
}

export function createRecordingStream(
  screenStream: MediaStream | null,
  webcamStream: MediaStream | null,
  canvas: HTMLCanvasElement
): MediaStream {
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Unable to get canvas context");

  // Set up video elements
  const screenVideo = screenStream ? setupVideoElement(screenStream) : null;
  const webcamVideo = webcamStream ? setupVideoElement(webcamStream) : null;

  // Function to draw the current frame
  function drawFrame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (screenVideo) {
      ctx.drawImage(screenVideo, 0, 0, canvas.width, canvas.height);
    }

    if (webcamVideo) {
      const webcamWidth = canvas.width / 4;
      const webcamHeight = (webcamWidth * 9) / 16;
      const x = canvas.width - webcamWidth - 20;
      const y = canvas.height - webcamHeight - 20;

      // Draw webcam with border
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(x, y, webcamWidth, webcamHeight, 8);
      ctx.clip();
      ctx.drawImage(webcamVideo, x, y, webcamWidth, webcamHeight);
      ctx.restore();

      // Draw border
      ctx.strokeStyle = "white";
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, webcamWidth, webcamHeight);
    }

    requestAnimationFrame(drawFrame);
  }

  // Start the drawing loop
  drawFrame();

  // Create a stream from the canvas
  const canvasStream = canvas.captureStream(30);

  // Add audio tracks from both streams
  const audioTracks: MediaStreamTrack[] = [];
  if (screenStream?.getAudioTracks().length) {
    audioTracks.push(screenStream.getAudioTracks()[0]);
  }
  if (webcamStream?.getAudioTracks().length) {
    audioTracks.push(webcamStream.getAudioTracks()[0]);
  }

  audioTracks.forEach((track) => {
    canvasStream.addTrack(track);
  });

  return canvasStream;
}
