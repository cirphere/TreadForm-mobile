import React from 'react';
import { useRouter } from 'expo-router';
import { useApp } from '@/context/AppContext';
import { CameraRecorder } from '@/components/camera-recorder';

export default function CameraScreen() {
  const router = useRouter();
  const { setVideoUri } = useApp();

  return (
    <CameraRecorder
      onVideoReady={(uri) => {
        setVideoUri(uri);
        router.replace('/analyzing');
      }}
      onBack={() => router.back()}
    />
  );
}
