import React from 'react';
import { VideoPreviewProps } from '../types/recorder';

export const VideoPreview: React.FC<VideoPreviewProps> = ({ url, duration }) => {
  return (
    <div className="mt-8">
      <h2 className="text-lg font-semibold mb-4">New Recording</h2>
      <div className="relative w-full max-w-3xl aspect-video bg-gray-900 rounded-lg overflow-hidden">
        <video
          src={url}
          controls
          className="w-full h-full object-contain"
        />
      </div>
      <p className="mt-2 text-sm text-gray-600">
        Video duration: {(duration / 1024 / 1024).toFixed(2)} MB
      </p>
    </div>
  );
};

