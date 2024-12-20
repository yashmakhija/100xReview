# Screen Recorder Component Documentation

## Table of Contents
1. [Overview](#overview)
2. [Component Structure](#component-structure)
3. [Key Functionalities](#key-functionalities)
4. [Workflow](#workflow)
5. [Technical Details](#technical-details)
6. [Usage](#usage)

## Overview

The Screen Recorder component is a React-based application that allows users to record their screen, webcam, or both simultaneously. It provides an intuitive interface with controls for managing various recording options and settings.

## Component Structure

The application is composed of several key files:

1. `ScreenRecorder.tsx`: The main component that renders the UI and orchestrates the recording functionality.
2. `hooks/useMediaDevices.ts`: A custom hook that manages media devices and recording state.
3. `utils/streamManager.ts`: Utility functions for managing media streams.
4. `utils/recorder.ts`: Utilities for handling the recording process and downloading recorded content.

## Key Functionalities

1. **Webcam Recording**: Capture video from the user's webcam.
2. **Screen Sharing**: Record the user's screen or a specific application window.
3. **Audio Recording**: Capture audio from the user's microphone.
4. **Combined Recording**: Simultaneously record screen and webcam, with the webcam feed displayed as a picture-in-picture.
5. **Full-screen Mode**: Toggle between windowed and full-screen display.
6. **Download Recordings**: Save recorded content as a webm file.

## Workflow

1. **Initialization**:
   - The `ScreenRecorder` component is mounted.
   - `useMediaDevices` hook is initialized, setting up initial state and refs.

2. **User Interaction**:
   - User can toggle webcam, screen sharing, and audio using the provided buttons.
   - Each toggle action triggers the corresponding function in `useMediaDevices`.

3. **Starting a Recording**:
   - User clicks the "Start Recording" button.
   - `startRecording` function in `useMediaDevices` is called.
   - A canvas is used to combine webcam and screen streams if both are active.
   - `MediaRecorderManager` begins capturing the canvas stream.

4. **During Recording**:
   - The `drawFrame` function continuously updates the canvas with the latest frame from active streams.
   - Recorded data is stored in chunks.

5. **Stopping a Recording**:
   - User clicks the "Stop Recording" button.
   - `stopRecording` function in `useMediaDevices` is called.
   - `MediaRecorderManager` stops the recording process.

6. **Downloading a Recording**:
   - After stopping the recording, a "Download Recording" button appears.
   - Clicking this button triggers the `downloadRecording` function.
   - The recorded video is saved as a webm file.

## Technical Details

### ScreenRecorder.tsx

- Uses the `useMediaDevices` hook to manage state and media functions.
- Renders video elements for webcam and screen sharing previews.
- Manages UI state for recording controls and error messages.

### useMediaDevices.ts

- Manages state for all media streams (webcam, screen, audio).
- Provides functions for toggling different media sources.
- Handles the recording process using `MediaRecorderManager`.
- Manages canvas drawing for combining video streams.

### streamManager.ts

- `StreamManager` class manages video elements for different streams.
- Provides utility functions for creating media streams.

### recorder.ts

- `MediaRecorderManager` class handles the recording process.
- Provides a utility function for downloading recorded content.

## Usage

To use the Screen Recorder in a React application:

1. Import the ScreenRecorder component:
   ```jsx
   import ScreenRecorder from '../src/components/ScreenRecorder.tsx';