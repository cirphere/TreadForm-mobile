import React from 'react';
import {View, TouchableOpacity, Text, StyleSheet} from 'react-native';
import {colors} from '@/constants/colors';

interface Props {
  mode: 'runner' | 'trainer';
  onChange: (mode: 'runner' | 'trainer') => void;
}

export function ModeToggle({mode, onChange}: Props) {
  return (
    <View style={s.container}>
      {(['runner', 'trainer'] as const).map(v => (
        <TouchableOpacity
          key={v}
          style={[s.tab, mode === v && s.tabActive]}
          onPress={() => onChange(v)}>
          <Text style={[s.tabText, mode === v && s.tabTextActive]}>
            {v === 'runner' ? '일반' : '트레이너'}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 3,
    backgroundColor: 'rgba(31, 37, 46, 0.06)',
    borderRadius: 999,
  },
  tab: {
    height: 30,
    paddingHorizontal: 14,
    borderRadius: 999,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: '#fff',
    boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.08)',
    elevation: 2,
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.labelAssist,
  },
  tabTextActive: {
    color: colors.labelStrong,
  },
});
