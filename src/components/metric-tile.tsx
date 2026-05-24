import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import {colors, statusColor} from '@/constants/colors';

interface Props {
  tag: string;
  name: string;
  value: string;
  status: string;
  statusLabel: string;
  onPress?: () => void;
}

export function MetricTile({tag, name, value, status, statusLabel, onPress}: Props) {
  const color = statusColor(status);

  return (
    <TouchableOpacity style={[s.tile, {borderTopColor: color}]} onPress={onPress} activeOpacity={0.7}>
      <View style={[s.tagBox, {backgroundColor: color + '15'}]}>
        <Text style={[s.tagText, {color}]}>{tag}</Text>
      </View>
      <Text style={s.name}>{name}</Text>
      <Text style={s.value}>{value}</Text>
      <Text style={[s.statusLabel, {color}]}>{statusLabel}</Text>
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  tile: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: colors.lineAlt,
    borderTopWidth: 3,
  },
  tagBox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tagText: {
    fontSize: 11,
    fontWeight: '700',
    fontFamily: 'monospace',
  },
  name: {
    fontSize: 11,
    color: colors.labelNeutral,
    marginTop: 8,
    fontWeight: '600',
  },
  value: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.labelStrong,
    marginTop: 2,
    fontFamily: 'monospace',
  },
  statusLabel: {
    fontSize: 10,
    fontWeight: '700',
    marginTop: 1,
    letterSpacing: 0.3,
  },
});
