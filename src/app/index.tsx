import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { useApp } from '@/context/AppContext';
import { ModeToggle } from '@/components/mode-toggle';
import { colors } from '@/constants/colors';

export default function HomeScreen() {
  const router = useRouter();
  const { mode, setMode, members, selectMember, setVideoUri } = useApp();

  const pickFromGallery = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['videos'],
      quality: 1,
    });
    if (!result.canceled && result.assets[0]) {
      setVideoUri(result.assets[0].uri);
      router.push('/analyzing');
    }
  };

  return (
    <SafeAreaView style={s.container}>
      <View style={s.toggleRow}>
        <ModeToggle mode={mode} onChange={setMode} />
      </View>

      {mode === 'runner' ? (
        <RunnerHome
          onRecord={() => router.push('/camera')}
          onGallery={pickFromGallery}
        />
      ) : (
        <TrainerHome
          members={members}
          onPickMember={(m: any) => {
            selectMember(m);
            router.push('/camera');
          }}
          onAddMember={() => router.push('/add-member')}
        />
      )}
    </SafeAreaView>
  );
}

function RunnerHome({ onRecord, onGallery }: { onRecord: () => void; onGallery: () => void }) {
  return (
    <View style={s.runnerContent}>
      <Text style={s.heroTitle}>{'오늘 러닝,\n측정해볼까요'}</Text>
      <Text style={s.heroDesc}>러닝 자세를 분석하고{'\n'}맞춤 코칭을 받아보세요</Text>

      <TouchableOpacity style={s.recordCard} onPress={onRecord} activeOpacity={0.8}>
        <Text style={s.recordCardTitle}>영상 촬영하기</Text>
        <Text style={s.recordCardSub}>카메라로 러닝 영상을 촬영합니다</Text>
      </TouchableOpacity>

      <TouchableOpacity style={s.galleryCard} onPress={onGallery} activeOpacity={0.8}>
        <Text style={s.galleryCardTitle}>갤러리에서 선택</Text>
        <Text style={s.galleryCardSub}>저장된 러닝 영상을 불러옵니다</Text>
      </TouchableOpacity>

      <Text style={s.hintText}>측면에서 촬영하면 더 정확한 분석이 가능합니다</Text>
    </View>
  );
}

function TrainerHome({
  members,
  onPickMember,
  onAddMember,
}: {
  members: any[];
  onPickMember: (m: any) => void;
  onAddMember: () => void;
}) {
  return (
    <View style={s.trainerContent}>
      <Text style={s.gymLabel}>피트니스 센터</Text>
      <Text style={s.trainerTitle}>오늘 {members.length}건</Text>

      <View style={s.rosterHeader}>
        <Text style={s.rosterTitle}>오늘 일정</Text>
        <Text style={s.rosterCount}>{members.length}</Text>
      </View>

      {members.length === 0 ? (
        <View style={s.emptyRoster}>
          <Text style={s.emptyText}>등록된 회원이 없습니다</Text>
        </View>
      ) : (
        members.map(m => (
          <TouchableOpacity
            key={m.id}
            style={s.memberCard}
            onPress={() => onPickMember(m)}
            activeOpacity={0.7}>
            <View style={s.memberAvatar}>
              <Text style={s.memberInitial}>{m.name[0]}</Text>
            </View>
            <View style={s.memberInfo}>
              <Text style={s.memberName}>{m.name}</Text>
              <Text style={s.memberMeta}>분석 {m.analyses.length}회</Text>
            </View>
          </TouchableOpacity>
        ))
      )}

      <TouchableOpacity style={s.addBtn} onPress={onAddMember} activeOpacity={0.8}>
        <Text style={s.addBtnText}>+ 회원 추가하고 측정</Text>
      </TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bgNormal },
  toggleRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingTop: 12, paddingBottom: 4 },

  runnerContent: { flex: 1, paddingHorizontal: 24 },
  heroTitle: { fontSize: 30, fontWeight: '700', color: colors.labelStrong, marginTop: 40, lineHeight: 36, letterSpacing: -0.5 },
  heroDesc: { fontSize: 15, color: colors.labelNeutral, marginTop: 12, lineHeight: 22 },

  recordCard: {
    marginTop: 32, padding: 20, borderRadius: 16,
    backgroundColor: colors.skeleton,
  },
  recordCardTitle: { fontSize: 16, fontWeight: '700', color: '#fff' },
  recordCardSub: { fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 4 },

  galleryCard: {
    marginTop: 12, padding: 20, borderRadius: 16,
    backgroundColor: '#fff', borderWidth: 1, borderColor: colors.lineNormal,
  },
  galleryCardTitle: { fontSize: 16, fontWeight: '700', color: colors.labelStrong },
  galleryCardSub: { fontSize: 13, color: colors.labelNeutral, marginTop: 4 },

  hintText: { fontSize: 12, color: colors.labelAssist, textAlign: 'center', marginTop: 24 },

  trainerContent: { flex: 1, paddingHorizontal: 20 },
  gymLabel: { fontSize: 11, color: colors.labelAssist, fontWeight: '600', marginTop: 20, letterSpacing: 0.3 },
  trainerTitle: { fontSize: 22, fontWeight: '700', color: colors.labelStrong, marginTop: 4 },

  rosterHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 20, marginBottom: 8 },
  rosterTitle: { fontSize: 13, fontWeight: '700', color: colors.labelStrong },
  rosterCount: { fontSize: 11, color: colors.labelAssist, fontWeight: '600' },

  emptyRoster: { padding: 40, alignItems: 'center' },
  emptyText: { color: colors.labelAssist, fontSize: 14 },

  memberCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    padding: 12, borderRadius: 12, backgroundColor: '#fff',
    borderWidth: 1, borderColor: colors.lineAlt, marginBottom: 6,
  },
  memberAvatar: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: colors.cool96,
    justifyContent: 'center', alignItems: 'center',
  },
  memberInitial: { fontSize: 14, fontWeight: '700', color: colors.labelStrong },
  memberInfo: { flex: 1 },
  memberName: { fontSize: 14, fontWeight: '700', color: colors.labelStrong },
  memberMeta: { fontSize: 11, color: colors.labelNeutral, marginTop: 2 },

  addBtn: {
    marginTop: 'auto', marginBottom: 32,
    height: 52, borderRadius: 14, backgroundColor: colors.labelStrong,
    justifyContent: 'center', alignItems: 'center',
  },
  addBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});
