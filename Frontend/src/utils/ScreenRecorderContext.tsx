import React, { createContext, useContext, useReducer, ReactNode } from "react";

interface State {
  isWebcamActive: boolean;
  isScreenActive: boolean;
  isAudioActive: boolean;
  isRecording: boolean;
  error: string | null;
  webcamStream: MediaStream | null;
  screenStream: MediaStream | null;
  audioStream: MediaStream | null;
}

type Action =
  | { type: "SET_WEBCAM_ACTIVE"; payload: boolean }
  | { type: "SET_SCREEN_ACTIVE"; payload: boolean }
  | { type: "SET_AUDIO_ACTIVE"; payload: boolean }
  | { type: "SET_RECORDING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "SET_WEBCAM_STREAM"; payload: MediaStream | null }
  | { type: "SET_SCREEN_STREAM"; payload: MediaStream | null }
  | { type: "SET_AUDIO_STREAM"; payload: MediaStream | null };

const initialState: State = {
  isWebcamActive: false,
  isScreenActive: false,
  isAudioActive: true,
  isRecording: false,
  error: null,
  webcamStream: null,
  screenStream: null,
  audioStream: null,
};

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "SET_WEBCAM_ACTIVE":
      return { ...state, isWebcamActive: action.payload };
    case "SET_SCREEN_ACTIVE":
      return { ...state, isScreenActive: action.payload };
    case "SET_AUDIO_ACTIVE":
      return { ...state, isAudioActive: action.payload };
    case "SET_RECORDING":
      return { ...state, isRecording: action.payload };
    case "SET_ERROR":
      return { ...state, error: action.payload };
    case "SET_WEBCAM_STREAM":
      return { ...state, webcamStream: action.payload };
    case "SET_SCREEN_STREAM":
      return { ...state, screenStream: action.payload };
    case "SET_AUDIO_STREAM":
      return { ...state, audioStream: action.payload };
    default:
      return state;
  }
};

const ScreenRecorderContext = createContext<
  | {
      state: State;
      dispatch: React.Dispatch<Action>;
    }
  | undefined
>(undefined);

export const ScreenRecorderProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  return (
    <ScreenRecorderContext.Provider value={{ state, dispatch }}>
      {children}
    </ScreenRecorderContext.Provider>
  );
};

export const useScreenRecorder = () => {
  const context = useContext(ScreenRecorderContext);
  if (context === undefined) {
    throw new Error(
      "useScreenRecorder must be used within a ScreenRecorderProvider"
    );
  }
  return context;
};
