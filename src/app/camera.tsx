import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { colors } from '@/constants/colors';
import { useApp } from '@/context/AppContext';

export default function CameraScreen() {
  const router = useRouter();
  const { setVideoUri } = useApp();
  const [recording, setRecording] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval>>();
  const elapsedRef = useRef(0);

  useEffect(() => {
    if (recording) {
      timerRef.current = setInterval(() => {
        elapsedRef.current += 1;
        setElapsed(elapsedRef.current);
        if (elapsedRef.current >= 10) {
          clearInterval(timerRef.current);
          setRecording(false);
        }
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [recording]);

  useEffect(() => {
    if (!recording && elapsed >= 10) {
      // TODO: 실제 카메라 녹화 시 여기서 videoUri를 세팅
      Alert.alert('안내', '실제 카메라 녹화는 네이티브 빌드가 필요합니다.\n갤러리에서 영상을 선택해주세요.');
    }
  }, [recording, elapsed]);

  const pickFromGallery = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['videos'],
      quality: 1,
    });

    if (!result.canceled && result.assets[0]) {
      setVideoUri(result.assets[0].uri);
      router.replace('/analyzing');
    }
  };

  const handleRecord = () => {
    if (recording) {
      clearInterval(timerRef.current);
      setRecording(false);
    } else {
      elapsedRef.current = 0;
      setElapsed(0);
      setRecording(true);
    }
  };

  return (
    <View style={s.container}>
      <View style={s.guideBox}>
        <View style={s.beltLine} />
        <View style={s.hipBox} />
        <Text style={s.guideText}>트레드밀 벨트에 맞춰주세요</Text>
      </View>

      <View style={s.topBar}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <Text style={s.backText}>{'<'}</Text>
        </TouchableOpacity>
        <View style={s.recIndicator}>
          {recording && <View style={s.recDot} />}
          <Text style={s.recTime}>
            {recording ? `${elapsed}s / 10s` : '측면에서 촬영'}
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
          onPress={handleRecord}
          activeOpacity={0.7}>
          <View style={[s.recordInner, recording && s.recordInnerActive]} />
        </TouchableOpacity>

        <TouchableOpacity style={s.sideBtn}>
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
  guideBox: { flex: 1, justifyContent: 'center', alignItems: 'center' },
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
  sideBtn: {
    alignItems: 'center', gap: 4,
  },
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
});
