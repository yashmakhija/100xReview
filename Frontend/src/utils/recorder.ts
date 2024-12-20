export class MediaRecorderManager {
  private mediaRecorder: MediaRecorder | null = null;
  private recordedChunks: Blob[] = [];
  private onDataAvailable: (chunks: Blob[]) => void;

  constructor(onDataAvailable: (chunks: Blob[]) => void) {
    this.onDataAvailable = onDataAvailable;
  }

  startRecording(stream: MediaStream) {
    try {
      this.recordedChunks = [];
      this.mediaRecorder = new MediaRecorder(stream, {
        mimeType: "video/webm;codecs=vp9",
        videoBitsPerSecond: 3000000,
      });

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.recordedChunks.push(event.data);
          this.onDataAvailable(this.recordedChunks);
        }
      };

      this.mediaRecorder.start(1000);
    } catch (error) {
      console.error("Error starting recording:", error);
      throw error;
    }
  }

  stopRecording() {
    if (this.mediaRecorder && this.mediaRecorder.state !== "inactive") {
      this.mediaRecorder.stop();
      this.mediaRecorder = null;
    }
  }

  isRecording(): boolean {
    return (
      this.mediaRecorder !== null && this.mediaRecorder.state === "recording"
    );
  }
}

export function downloadRecording(chunks: Blob[]) {
  if (chunks.length === 0) return;

  const blob = new Blob(chunks, { type: "video/webm" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `recording-${new Date().toISOString()}.webm`;
  a.click();
  URL.revokeObjectURL(url);
}
