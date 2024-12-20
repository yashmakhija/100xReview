import { atom } from "recoil";
import { Submission } from "../types/submission";

export const submissionState = atom<Submission | null>({
  key: "submissionState",
  default: null,
});

export const reviewNotesState = atom<string>({
  key: "reviewNotesState",
  default: "",
});

export const reviewErrorState = atom<string | null>({
  key: "reviewErrorState",
  default: null,
});

export const isLoadingState = atom<boolean>({
  key: "isLoadingState",
  default: true,
});

export const validationErrorsState = atom<{ [key: string]: string }>({
  key: "validationErrorsState",
  default: {},
});

export const newRecordingBlobState = atom<Blob | null>({
  key: "newRecordingBlobState",
  default: null,
});
