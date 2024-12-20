import { atom } from 'recoil';

export const webcamStreamState = atom<MediaStream | null>({
  key: 'webcamStreamState',
  default: null,
});

export const screenStreamState = atom<MediaStream | null>({
  key: 'screenStreamState',
  default: null,
});

export const isWebcamActiveState = atom<boolean>({
  key: 'isWebcamActiveState',
  default: false,
});

export const isScreenActiveState = atom<boolean>({
  key: 'isScreenActiveState',
  default: false,
});

export const isAudioActiveState = atom<boolean>({
  key: 'isAudioActiveState',
  default: false,
});

export const isRecordingState = atom<boolean>({
  key: 'isRecordingState',
  default: false,
});

export const recordedBlobState = atom<Blob | null>({
  key: 'recordedBlobState',
  default: null,
});

export const errorState = atom<string | null>({
  key: 'errorState',
  default: null,
});

