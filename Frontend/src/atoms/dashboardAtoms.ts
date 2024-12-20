import { atom } from "recoil";
import { Course, Project, ScheduleItem } from "../types/dashboard";

export const darkModeState = atom({
  key: "darkModeState",
  default: false,
});

export const activeTabState = atom({
  key: "activeTabState",
  default: "projects",
});

export const loadingState = atom({
  key: "loadingState",
  default: true,
});

export const errorState = atom({
  key: "errorState",
  default: null as string | null,
});

export const coursesState = atom({
  key: "coursesState",
  default: [] as Course[],
});

export const selectedCourseIdState = atom({
  key: "selectedCourseIdState",
  default: 0,
});

export const projectsState = atom({
  key: "projectsState",
  default: [] as Project[],
});

export const weeklyScheduleState = atom({
  key: "weeklyScheduleState",
  default: [] as ScheduleItem[],
});

export const isModalOpenState = atom({
  key: "isModalOpenState",
  default: false,
});

export const selectedProjectState = atom({
  key: "selectedProjectState",
  default: null as Project | null,
});

export const submittingState = atom({
  key: "submittingState",
  default: false,
});
