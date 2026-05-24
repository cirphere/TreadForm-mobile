import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import {
  Camera,
  useCameraPermission,
  useMicrophonePermission,
  useVideoOutput,
  CommonResolutions,
} from 'react-native-vision-camera';
import type { Recorder } from 'react-native-vision-camera';
import { colors } from '@/constants/colors';
import { pickVideoFromGallery } from '@/utils/pickVideo';

const MAX_DURATION_SEC = 10;

interface Props {
  onVideoReady: (uri: string) => void;
  onBack: () => void;
}

export function CameraRecorder({ onVideoReady, onBack }: Props) {
  const camPerm = useCameraPermission();
  const micPerm = useMicrophonePermission();

  const [facing, setFacing] = useState<'back' | 'front'>('back');
  const [recording, setRecording] = useState<boolean>(false);
  const [elapsed, setElapsed] = useState<number>(0);
  const [ready, setReady] = useState<boolean>(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);
  const recorderRef = useRef<Recorder | null>(null);

  const videoOutput = useVideoOutput({
    targetResolution: CommonResolutions.FHD_16_9,
    enableAudio: false,
  });

  useEffect(() => {
    if (!camPerm.hasPermission && camPerm.canRequestPermission) camPerm.requestPermission();
    if (!micPerm.hasPermission && micPerm.canRequestPermission) micPerm.requestPermission();
  }, []);

  useEffect(() => {
    if (recording) {
      const start = Date.now();
      timerRef.current = setInterval(() => {
        const sec = Math.floor((Date.now() - start) / 1000);
        setElapsed(sec);
        if (sec >= MAX_DURATION_SEC) stopRecording();
      }, 500);
    }
    return () => clearInterval(timerRef.current);
  }, [recording]);

  const startRecording = useCallback(async () => {
    if (!ready || recording) return;
    try {
      const recorder = await videoOutput.createRecorder({});
      recorderRef.current = recorder;
      setRecording(true);
      setElapsed(0);

      await recorder.startRecording(
        (filePath) => {
          setRecording(false);
          clearInterval(timerRef.current);
          recorderRef.current = null;
          onVideoReady(filePath);
        },
        (error) => {
          setRecording(false);
          clearInterval(timerRef.current);
          recorderRef.current = null;
          Alert.alert('녹화 오류', error.message || '녹화에 실패했습니다.');
        },
      );
    } catch (e: any) {
      setRecording(false);
      Alert.alert('녹화 오류', e?.message || '녹화를 시작할 수 없습니다.');
    }
  }, [ready, recording, videoOutput, onVideoReady]);

  const stopRecording = useCallback(() => {
    recorderRef.current?.stopRecording();
  }, []);

  const pickFromGallery = async () => {
    const uri = await pickVideoFromGallery();
    if (uri) onVideoReady(uri);
  };

  if (!camPerm.hasPermission || !micPerm.hasPermission) {
    return (
      <View style={s.container}>
        <View style={s.permissionBox}>
          <Text style={s.permissionText}>카메라와 마이크 권한이 필요합니다</Text>
          <TouchableOpacity
            style={s.permissionBtn}
            onPress={() => { camPerm.requestPermission(); micPerm.requestPermission(); }}>
            <Text style={s.permissionBtnText}>권한 허용</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.permissionBackBtn} onPress={onBack}>
            <Text style={s.permissionBackText}>돌아가기</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={s.container}>
      <Camera
        style={StyleSheet.absoluteFill}
        isActive={true}
        device={facing}
        outputs={[videoOutput]}
        constraints={[{ fps: 60 }]}
        onStarted={() => setReady(true)}
        onStopped={() => setReady(false)}
        resizeMode="cover"
      />

      <View style={s.guideBox}>
        <View style={s.beltLine} />
        <View style={s.hipBox} />
        <Text style={s.guideText}>트레드밀 벨트에 맞춰주세요</Text>
      </View>

      <View style={s.topBar}>
        <TouchableOpacity onPress={onBack} style={s.backBtn}>
          <Text style={s.backText}>{'<'}</Text>
        </TouchableOpacity>
        <View style={s.recIndicator}>
          {recording && <View style={s.recDot} />}
          <Text style={s.recTime}>
            {recording ? `${elapsed}s / ${MAX_DURATION_SEC}s` : '측면에서 촬영 · 60fps'}
          </Text>
        </View>
      </View>

      <View style={s.bottomBar}>
        <TouchableOpacity style={s.sideBtn} onPress={pickFromGallery}>
          <View style={s.sideBtnIcon}>
            <Text style={s.sideBtnEmoji}>{'🖼'}</Text>
          </View>
          <Text style={s.sideBtnText}>갤러리</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[s.recordBtn, recording && s.recordBtnActive]}
          onPress={() => recording ? stopRecording() : startRecording()}
          disabled={!ready}
          activeOpacity={0.7}>
          <View style={[s.recordInner, recording && s.recordInnerActive]} />
        </TouchableOpacity>

        <TouchableOpacity
          style={s.sideBtn}
          onPress={() => setFacing(f => f === 'back' ? 'front' : 'back')}
          disabled={recording}>
          <View style={s.sideBtnIcon}>
            <Text style={s.sideBtnEmoji}>{'🔄'}</Text>
          </View>
          <Text style={s.sideBtnText}>전환</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.cam },
  guideBox: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    justifyContent: 'center', alignItems: 'center',
  },
  beltLine: {
    width: '80%', height: 1.5, position: 'absolute', bottom: '30%',
    backgroundColor: 'rgba(91, 229, 198, 0.4)',
  },
  hipBox: {
    width: 120, height: 160, borderWidth: 1.5,
    borderColor: 'rgba(91, 229, 198, 0.3)', borderRadius: 8,
    borderStyle: 'dashed',
  },
  guideText: {
    position: 'absolute', bottom: '22%',
    color: 'rgba(255,255,255,0.6)', fontSize: 13, fontWeight: '600',
  },
  topBar: {
    position: 'absolute', top: 0, left: 0, right: 0,
    flexDirection: 'row', alignItems: 'center',
    paddingTop: 50, paddingHorizontal: 20,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center', alignItems: 'center',
  },
  backText: { color: '#fff', fontSize: 18, fontWeight: '700' },
  recIndicator: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', gap: 8,
  },
  recDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.danger },
  recTime: { color: '#fff', fontSize: 14, fontWeight: '600', fontFamily: 'monospace' },
  bottomBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around',
    paddingBottom: 40, paddingTop: 20,
  },
  sideBtn: { alignItems: 'center', gap: 4 },
  sideBtnIcon: {
    width: 48, height: 48, borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center', alignItems: 'center',
  },
  sideBtnEmoji: { fontSize: 20 },
  sideBtnText: { color: 'rgba(255,255,255,0.8)', fontSize: 10, fontWeight: '600' },
  recordBtn: {
    width: 72, height: 72, borderRadius: 36,
    borderWidth: 4, borderColor: '#fff',
    justifyContent: 'center', alignItems: 'center',
  },
  recordBtnActive: { borderColor: colors.danger },
  recordInner: { width: 56, height: 56, borderRadius: 28, backgroundColor: colors.danger },
  recordInnerActive: { width: 28, height: 28, borderRadius: 4 },
  permissionBox: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40 },
  permissionText: { fontSize: 16, fontWeight: '600', color: '#fff', textAlign: 'center' },
  permissionBtn: {
    marginTop: 20, paddingHorizontal: 24, paddingVertical: 12,
    backgroundColor: colors.skeleton, borderRadius: 12,
  },
  permissionBtnText: { fontSize: 14, fontWeight: '700', color: '#fff' },
  permissionBackBtn: { marginTop: 12, padding: 12 },
  permissionBackText: { fontSize: 14, color: 'rgba(255,255,255,0.6)' },
});
