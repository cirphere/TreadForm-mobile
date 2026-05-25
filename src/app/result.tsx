import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Platform } from 'react-native';
import { VideoView, useVideoPlayer } from 'expo-video';
import { useRouter } from 'expo-router';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { colors } from '@/constants/colors';
import { useApp } from '@/context/AppContext';
import { videoUrl, csvUrl } from '@/services/api';
import { MetricTile } from '@/components/metric-tile';
import { CoachingCard } from '@/components/coaching-card';
import { DangerTimeline } from '@/components/danger-timeline';

type Tab = 'overview' | 'timeline' | 'report';

export default function ResultScreen() {
  const router = useRouter();
  const { currentAnalysis, mode } = useApp();
  const [tab, setTab] = useState<Tab>('overview');
  const [downloading, setDownloading] = useState(false);

  if (!currentAnalysis) {
    router.replace('/');
    return null;
  }

  const a = currentAnalysis;

  const handleDownloadCsv = async () => {
    if (downloading) return;
    setDownloading(true);
    try {
      const url = csvUrl(a.analysis_id);

      if (Platform.OS === 'web') {
        const link = document.createElement('a');
        link.href = url;
        link.download = `report_${a.analysis_id}.csv`;
        link.click();
      } else {
        const dest = new File(Paths.cache, `report_${a.analysis_id}.csv`);
        const downloaded = await File.downloadFileAsync(url, dest);
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(downloaded.uri, { mimeType: 'text/csv', UTI: 'public.comma-separated-values-text' });
        } else {
          Alert.alert('완료', `파일이 저장되었습니다:\n${downloaded.uri}`);
        }
      }
    } catch (e: any) {
      Alert.alert('다운로드 실패', e.message || '네트워크 오류가 발생했습니다.');
    } finally {
      setDownloading(false);
    }
  };

  const player = useVideoPlayer(videoUrl(a.analysis_id), p => {
    p.loop = true;
  });
  const knee = a.metrics.knee_flexion;
  const foot = a.metrics.foot_strike;
  const vosc = a.metrics.vertical_oscillation;
  const heelCount = foot.status_counts.heel_strike || 0;

  const topStatus = (counts: Record<string, number>) => {
    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    return sorted[0]?.[0] || 'good';
  };

  const TABS: { id: Tab; label: string }[] = [
    { id: 'overview', label: '종합' },
    { id: 'timeline', label: '타임라인' },
    { id: 'report', label: '리포트' },
  ];

  return (
    <View style={s.container}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.replace('/')} style={s.backBtn}>
          <Text style={s.backText}>{'<'}</Text>
        </TouchableOpacity>
        <View style={s.headerCenter}>
          <Text style={s.headerSub}>
            {mode === 'trainer' ? '회원 분석' : '자가 측정'}
          </Text>
          <Text style={s.headerTitle}>{TABS.find(t => t.id === tab)?.label}</Text>
        </View>
        <TouchableOpacity style={s.shareBtn}>
          <Text style={s.shareText}>공유</Text>
        </TouchableOpacity>
      </View>

      <View style={s.tabBar}>
        {TABS.map(t => (
          <TouchableOpacity
            key={t.id}
            style={[s.tabBtn, tab === t.id && s.tabBtnActive]}
            onPress={() => setTab(t.id)}>
            <Text style={[s.tabText, tab === t.id && s.tabTextActive]}>
              {t.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={s.scroll} contentContainerStyle={s.scrollContent}>
        {tab === 'overview' && (
          <>
            <View style={s.videoContainer}>
              <VideoView
                player={player}
                style={s.video}
                contentFit="contain"
                nativeControls
              />
            </View>

            <View style={s.metricsRow}>
              <MetricTile
                tag="K" name="무릎 굴곡"
                value={`${knee.avg_angle.toFixed(0)}°`}
                status={topStatus(knee.status_counts)}
                statusLabel={topStatus(knee.status_counts) === 'good_flexion' ? 'Good Flexion' : 'Stiff Knee'}
              />
              <MetricTile
                tag="S" name="발 착지"
                value={`x${heelCount}`}
                status={heelCount > 0 ? 'heel_strike' : 'good'}
                statusLabel={heelCount > 0 ? 'Heel Strike' : 'Mid-Foot'}
              />
              <MetricTile
                tag="O" name="진폭"
                value={`${(vosc.avg_value * 100).toFixed(1)}`}
                status={vosc.status === 'high_oscillation' ? 'danger' : 'good'}
                statusLabel={vosc.status === 'high_oscillation' ? 'High' : 'Good'}
              />
            </View>

            <CoachingCard
              message={a.coach_message}
              dangerCount={a.summary.danger_count}
              onPress={() => setTab('report')}
            />
          </>
        )}

        {tab === 'timeline' && (
          <>
            <View style={s.videoContainer}>
              <VideoView
                player={player}
                style={s.video}
                contentFit="contain"
                nativeControls
              />
            </View>
            <DangerTimeline
              timestamps={a.danger_timestamps}
              durationSec={a.summary.duration_sec}
              onSeek={(timeSec) => {
                player.currentTime = timeSec;
                player.play();
              }}
            />
          </>
        )}

        {tab === 'report' && (
          <View style={s.reportSection}>
            <View style={s.reportCard}>
              <Text style={s.reportTitle}>분석 요약</Text>
              {[
                ['분석 ID', a.analysis_id],
                ['영상 길이', `${a.summary.duration_sec.toFixed(1)}초`],
                ['케이던스', `${a.summary.cadence_spm} spm`],
                ['총 착지', `${a.summary.total_strikes}회`],
                ['신뢰도', a.confidence],
              ].map(([label, value], i) => (
                <View key={i} style={s.reportRow}>
                  <Text style={s.reportLabel}>{label}</Text>
                  <Text style={s.reportValue}>{value}</Text>
                </View>
              ))}
              <View style={s.reportRow}>
                <Text style={s.reportLabel}>위험 감지</Text>
                <Text style={[s.reportValue, { color: colors.danger }]}>{a.summary.danger_count}회</Text>
              </View>
            </View>

            {a.warnings.length > 0 && (
              <View style={s.warningsCard}>
                <Text style={s.reportTitle}>경고</Text>
                {a.warnings.map((w, i) => (
                  <Text key={i} style={s.warningText}>{w.message_ko}</Text>
                ))}
              </View>
            )}

            <View style={s.coachCard}>
              <Text style={s.reportTitle}>AI 코칭 메시지</Text>
              <Text style={s.coachText}>{a.coach_message}</Text>
            </View>

            <TouchableOpacity style={[s.downloadBtn, downloading && s.downloadBtnDisabled]} activeOpacity={0.7} onPress={handleDownloadCsv} disabled={downloading}>
              <Text style={s.downloadText}>{downloading ? '다운로드 중...' : 'CSV 리포트 다운로드'}</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bgNormal },

  header: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16,
    paddingTop: 50, paddingBottom: 4,
  },
  backBtn: { width: 36, height: 36, justifyContent: 'center', alignItems: 'center' },
  backText: { fontSize: 20, fontWeight: '700', color: colors.labelStrong },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerSub: { fontSize: 11, color: colors.labelAssist, fontWeight: '600' },
  headerTitle: { fontSize: 14, fontWeight: '700', color: colors.labelStrong },
  shareBtn: { width: 36, height: 36, justifyContent: 'center', alignItems: 'center' },
  shareText: { fontSize: 12, color: colors.labelNormal, fontWeight: '600' },

  tabBar: {
    flexDirection: 'row', paddingHorizontal: 12, paddingTop: 4,
    borderBottomWidth: 1, borderBottomColor: colors.lineAlt,
  },
  tabBtn: {
    flex: 1, height: 40, justifyContent: 'center', alignItems: 'center',
    borderBottomWidth: 2, borderBottomColor: 'transparent',
  },
  tabBtnActive: { borderBottomColor: colors.labelStrong },
  tabText: { fontSize: 13, fontWeight: '600', color: colors.labelAssist },
  tabTextActive: { color: colors.labelStrong, fontWeight: '700' },

  scroll: { flex: 1 },
  scrollContent: { padding: 16, gap: 12, paddingBottom: 40 },

  videoContainer: {
    height: 280, borderRadius: 16, backgroundColor: colors.cam,
    overflow: 'hidden',
  },
  video: { flex: 1 },

  metricsRow: { flexDirection: 'row', gap: 8 },

  reportSection: { gap: 12 },
  reportCard: {
    backgroundColor: '#fff', borderRadius: 12, padding: 16,
    borderWidth: 1, borderColor: colors.lineAlt, gap: 8,
  },
  reportTitle: { fontSize: 14, fontWeight: '700', color: colors.labelStrong, marginBottom: 4 },
  reportRow: { flexDirection: 'row', justifyContent: 'space-between' },
  reportLabel: { fontSize: 13, color: colors.labelNeutral },
  reportValue: { fontSize: 13, fontWeight: '600', color: colors.labelStrong, fontFamily: 'monospace' },

  warningsCard: {
    backgroundColor: colors.warnBg, borderRadius: 12, padding: 16,
    borderWidth: 1, borderColor: colors.warn + '30', gap: 4,
  },
  warningText: { fontSize: 13, color: '#9A6500', lineHeight: 18 },

  coachCard: {
    backgroundColor: '#fff', borderRadius: 12, padding: 16,
    borderWidth: 1, borderColor: colors.lineAlt,
  },
  coachText: { fontSize: 14, color: colors.labelStrong, lineHeight: 22, marginTop: 4 },

  downloadBtn: {
    height: 48, borderRadius: 12, backgroundColor: colors.labelStrong,
    justifyContent: 'center', alignItems: 'center',
  },
  downloadBtnDisabled: { opacity: 0.5 },
  downloadText: { color: '#fff', fontSize: 14, fontWeight: '700' },
});
