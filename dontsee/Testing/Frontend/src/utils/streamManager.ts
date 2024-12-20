export class StreamManager {
  private videoElements: Map<string, HTMLVideoElement> = new Map();

  getVideoElement(stream: MediaStream, id: string): HTMLVideoElement {
    let video = this.videoElements.get(id);
    if (!video) {
      video = document.createElement("video");
      video.srcObject = stream;
      video.autoplay = true;
      video.playsInline = true;
      video.muted = true;

      video.onloadedmetadata = () => {
        video.play().catch((error) => {
          console.error("Error playing video:", error);
        });
      };

      this.videoElements.set(id, video);
    }
    return video;
  }

  removeVideoElement(id: string) {
    const video = this.videoElements.get(id);
    if (video) {
      if (video.srcObject instanceof MediaStream) {
        video.srcObject.getTracks().forEach((track) => track.stop());
      }
      video.srcObject = null;
      this.videoElements.delete(id);
    }
  }

  cleanup() {
    this.videoElements.forEach((video, id) => {
      this.removeVideoElement(id);
    });
  }
}

export async function createMediaStream(
  constraints: MediaStreamConstraints
): Promise<MediaStream> {
  try {
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    return stream;
  } catch (error) {
    console.error("Error creating media stream:", error);
    throw error;
  }
}

export async function createDisplayStream(): Promise<MediaStream> {
  try {
    const stream = await navigator.mediaDevices.getDisplayMedia({
      video: {
        displaySurface: "monitor",
        logicalSurface: true,
        cursor: "always",
        frameRate: { ideal: 30 },
      },
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
      },
    });
    return stream;
  } catch (error) {
    console.error("Error creating display stream:", error);
    throw error;
  }
}
