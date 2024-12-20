export const createMediaRecorder = (
  stream: MediaStream,
  onDataAvailable: (event: BlobEvent) => void,
  onStop: () => void
) => {
  let mimeType = "video/webm;codecs=vp9,opus";
  if (!MediaRecorder.isTypeSupported(mimeType)) {
    mimeType = "video/webm";
  }

  const mediaRecorder = new MediaRecorder(stream, {
    mimeType: mimeType,
  });

  mediaRecorder.ondataavailable = onDataAvailable;
  mediaRecorder.onstop = onStop;

  return mediaRecorder;
};
