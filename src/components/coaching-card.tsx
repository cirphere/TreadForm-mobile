import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import {colors} from '@/constants/colors';

interface Props {
  message: string;
  dangerCount: number;
  onPress?: () => void;
}

export function CoachingCard({message, dangerCount, onPress}: Props) {
  const firstLine = message.split('\n')[0];

  return (
    <TouchableOpacity style={s.card} onPress={onPress} activeOpacity={0.7}>
      <View style={s.badge}>
        <Text style={s.badgeText}>{dangerCount}</Text>
      </View>
      <View style={s.content}>
        <Text style={s.label}>우선순위 코칭</Text>
        <Text style={s.message} numberOfLines={2}>
          {firstLine}
        </Text>
      </View>
      <Text style={s.chevron}>{'>'}</Text>
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  card: {
    padding: 12,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: colors.lineAlt,
    borderLeftWidth: 3,
    borderLeftColor: colors.danger,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  badge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.danger,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
    fontFamily: 'monospace',
  },
  content: {
    flex: 1,
  },
  label: {
    fontSize: 10,
    color: colors.labelAssist,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  message: {
    fontSize: 13,
    color: colors.labelStrong,
    lineHeight: 18,
    fontWeight: '600',
    marginTop: 2,
  },
  chevron: {
    color: colors.labelNeutral,
    fontSize: 16,
  },
});
