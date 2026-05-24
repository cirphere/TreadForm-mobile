import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '@/constants/colors';
import { useApp } from '@/context/AppContext';

export default function AddMemberScreen() {
  const router = useRouter();
  const { addMember, selectMember } = useApp();
  const [name, setName] = useState('');

  const handleAdd = () => {
    if (!name.trim()) return;
    const member = addMember(name.trim());
    selectMember(member);
    router.replace('/camera');
  };

  return (
    <View style={s.container}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <Text style={s.backText}>{'<'}</Text>
        </TouchableOpacity>
        <Text style={s.title}>회원 등록</Text>
        <View style={s.backBtn} />
      </View>

      <View style={s.form}>
        <Text style={s.label}>회원 이름</Text>
        <TextInput
          style={s.input}
          placeholder="이름을 입력하세요"
          placeholderTextColor={colors.labelAssist}
          value={name}
          onChangeText={setName}
          autoFocus
        />
      </View>

      <TouchableOpacity
        style={[s.submitBtn, !name.trim() && s.submitBtnDisabled]}
        onPress={handleAdd}
        disabled={!name.trim()}
        activeOpacity={0.8}>
        <Text style={s.submitText}>등록하고 측정 시작</Text>
      </TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bgNormal },
  header: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16,
    paddingTop: 50, paddingBottom: 16,
  },
  backBtn: { width: 36, height: 36, justifyContent: 'center', alignItems: 'center' },
  backText: { fontSize: 20, fontWeight: '700', color: colors.labelStrong },
  title: { flex: 1, textAlign: 'center', fontSize: 16, fontWeight: '700', color: colors.labelStrong },

  form: { paddingHorizontal: 24, marginTop: 20 },
  label: { fontSize: 13, fontWeight: '700', color: colors.labelStrong, marginBottom: 8 },
  input: {
    height: 48, borderRadius: 12, borderWidth: 1, borderColor: colors.lineNormal,
    paddingHorizontal: 16, fontSize: 16, color: colors.labelStrong,
  },

  submitBtn: {
    marginHorizontal: 24, marginTop: 'auto', marginBottom: 32,
    height: 52, borderRadius: 14, backgroundColor: colors.labelStrong,
    justifyContent: 'center', alignItems: 'center',
  },
  submitBtnDisabled: { opacity: 0.3 },
  submitText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});
