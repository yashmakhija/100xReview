import { configureStore } from "@reduxjs/toolkit";
import screenRecorderReducer from "./screenRecorderSlice";

export const store = configureStore({
  reducer: {
    screenRecorder: screenRecorderReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
