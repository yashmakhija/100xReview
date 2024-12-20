import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface ScreenRecorderState {
  isWebcamActive: boolean;
  isScreenActive: boolean;
  isAudioActive: boolean;
  isRecording: boolean;
  error: string | null;
}

const initialState: ScreenRecorderState = {
  isWebcamActive: false,
  isScreenActive: false,
  isAudioActive: true,
  isRecording: false,
  error: null,
};

const screenRecorderSlice = createSlice({
  name: "screenRecorder",
  initialState,
  reducers: {
    setWebcamActive: (state, action: PayloadAction<boolean>) => {
      state.isWebcamActive = action.payload;
    },
    setScreenActive: (state, action: PayloadAction<boolean>) => {
      state.isScreenActive = action.payload;
    },
    setAudioActive: (state, action: PayloadAction<boolean>) => {
      state.isAudioActive = action.payload;
    },
    setRecording: (state, action: PayloadAction<boolean>) => {
      state.isRecording = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const {
  setWebcamActive,
  setScreenActive,
  setAudioActive,
  setRecording,
  setError,
} = screenRecorderSlice.actions;

export default screenRecorderSlice.reducer;
