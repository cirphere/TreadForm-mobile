import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '@/constants/colors';
import { pickVideoFromGallery } from '@/utils/pickVideo';

interface Props {
  onVideoReady: (uri: string) => void;
  onBack: () => void;
}

export function CameraRecorder({ onVideoReady, onBack }: Props) {
  const pickFromGallery = async () => {
    const uri = await pickVideoFromGallery();
    if (uri) onVideoReady(uri);
  };

  return (
    <View style={s.container}>
      <View style={s.content}>
        <Text style={s.title}>웹에서는 카메라 녹화를 지원하지 않습니다</Text>
        <Text style={s.desc}>갤러리에서 영상을 선택해주세요</Text>

        <TouchableOpacity style={s.galleryBtn} onPress={pickFromGallery} activeOpacity={0.8}>
          <Text style={s.galleryBtnText}>갤러리에서 선택</Text>
        </TouchableOpacity>

        <TouchableOpacity style={s.backBtn} onPress={onBack}>
          <Text style={s.backBtnText}>돌아가기</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.cam, justifyContent: 'center', alignItems: 'center' },
  content: { alignItems: 'center', paddingHorizontal: 40 },
  title: { fontSize: 18, fontWeight: '700', color: '#fff', textAlign: 'center' },
  desc: { fontSize: 14, color: 'rgba(255,255,255,0.6)', marginTop: 8, textAlign: 'center' },
  galleryBtn: {
    marginTop: 24, paddingHorizontal: 32, paddingVertical: 14,
    backgroundColor: colors.skeleton, borderRadius: 12,
  },
  galleryBtnText: { fontSize: 15, fontWeight: '700', color: '#fff' },
  backBtn: { marginTop: 12, padding: 12 },
  backBtnText: { fontSize: 14, color: 'rgba(255,255,255,0.6)' },
});
