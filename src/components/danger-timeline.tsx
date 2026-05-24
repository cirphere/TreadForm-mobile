import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import {colors} from '@/constants/colors';
import {DangerTimestamp} from '@/types/analysis';

interface Props {
  timestamps: DangerTimestamp[];
  durationSec: number;
  onSeek?: (timeSec: number) => void;
}

const TYPE_LABELS: Record<string, string> = {
  heel_strike: '뒤꿈치',
  stiff_knee: '무릎 경직',
  over_stride: '오버스트라이드',
  high_oscillation: '수직 진폭',
};

export function DangerTimeline({timestamps, durationSec, onSeek}: Props) {
  if (timestamps.length === 0) {
    return (
      <View style={s.container}>
        <Text style={s.title}>위험 구간 타임라인</Text>
        <View style={s.emptyBox}>
          <Text style={s.emptyIcon}>{'✓'}</Text>
          <Text style={s.emptyText}>위험 자세가 감지되지 않았습니다</Text>
          <Text style={s.emptyHint}>전반적으로 안정적인 러닝 자세입니다</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={s.container}>
      <Text style={s.title}>위험 구간 타임라인</Text>
      <View style={s.track}>
        {timestamps.map((d, i) => (
          <TouchableOpacity
            key={i}
            style={[
              s.marker,
              {left: `${(d.time_sec / durationSec) * 100}%`},
            ]}
            onPress={() => onSeek?.(d.time_sec)}
            hitSlop={{top: 12, bottom: 12, left: 8, right: 8}}
          />
        ))}
      </View>
      <View style={s.list}>
        {timestamps.map((d, i) => (
          <TouchableOpacity key={i} style={s.item} onPress={() => onSeek?.(d.time_sec)} activeOpacity={0.6}>
            <View style={s.dot} />
            <Text style={s.time}>{d.time_sec.toFixed(1)}s</Text>
            <Text style={s.type}>{TYPE_LABELS[d.type] || d.type}</Text>
            {onSeek && <Text style={s.seekHint}>{'▶'}</Text>}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.lineAlt,
  },
  title: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.labelStrong,
    marginBottom: 12,
  },
  track: {
    height: 6,
    backgroundColor: colors.cool96,
    borderRadius: 3,
    marginBottom: 12,
    position: 'relative',
  },
  marker: {
    position: 'absolute',
    top: -2,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.danger,
    marginLeft: -5,
  },
  emptyBox: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  emptyIcon: {
    fontSize: 32,
    color: colors.good,
  },
  emptyText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.good,
    marginTop: 8,
  },
  emptyHint: {
    fontSize: 12,
    color: colors.labelAssist,
    marginTop: 4,
  },
  list: {
    gap: 6,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.danger,
  },
  time: {
    fontSize: 12,
    fontFamily: 'monospace',
    fontWeight: '600',
    color: colors.labelNeutral,
    width: 40,
  },
  type: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.labelStrong,
    flex: 1,
  },
  seekHint: {
    fontSize: 10,
    color: colors.labelAssist,
  },
});
