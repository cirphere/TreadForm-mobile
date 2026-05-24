import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, Animated, Easing } from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '@/constants/colors';
import { useApp } from '@/context/AppContext';
import { analyzeVideo } from '@/services/api';

function RunningPerson({ progress }: { progress: number }) {
  const legAnim = useRef(new Animated.Value(0)).current;
  const armAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const legLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(legAnim, { toValue: 1, duration: 200, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(legAnim, { toValue: -1, duration: 200, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(legAnim, { toValue: 0, duration: 200, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    );
    const armLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(armAnim, { toValue: 1, duration: 200, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(armAnim, { toValue: -1, duration: 200, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(armAnim, { toValue: 0, duration: 200, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    );
    legLoop.start();
    armLoop.start();
    return () => { legLoop.stop(); armLoop.stop(); };
  }, [legAnim, armAnim]);

  const leftLegRotate = legAnim.interpolate({ inputRange: [-1, 0, 1], outputRange: ['-30deg', '0deg', '30deg'] });
  const rightLegRotate = legAnim.interpolate({ inputRange: [-1, 0, 1], outputRange: ['30deg', '0deg', '-30deg'] });
  const leftArmRotate = armAnim.interpolate({ inputRange: [-1, 0, 1], outputRange: ['25deg', '0deg', '-25deg'] });
  const rightArmRotate = armAnim.interpolate({ inputRange: [-1, 0, 1], outputRange: ['-25deg', '0deg', '25deg'] });

  const TRACK_W = 240;
  const PERSON_W = 24;
  const left = Math.min((progress / 100) * TRACK_W - PERSON_W / 2, TRACK_W - PERSON_W / 2);

  return (
    <View style={[runnerStyles.wrapper, { left: Math.max(0, left), width: PERSON_W }]}>
      {/* Head */}
      <View style={runnerStyles.head} />
      {/* Body */}
      <View style={runnerStyles.body}>
        {/* Arms */}
        <Animated.View style={[runnerStyles.armLeft, { transform: [{ rotate: leftArmRotate }] }]} />
        <Animated.View style={[runnerStyles.armRight, { transform: [{ rotate: rightArmRotate }] }]} />
      </View>
      {/* Legs */}
      <View style={runnerStyles.legContainer}>
        <Animated.View style={[runnerStyles.leg, { transform: [{ rotate: leftLegRotate }] }]} />
        <Animated.View style={[runnerStyles.leg, { transform: [{ rotate: rightLegRotate }] }]} />
      </View>
    </View>
  );
}

const RUNNER_COLOR = colors.skeleton;

const runnerStyles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    bottom: 8,
    alignItems: 'center',
  },
  head: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: RUNNER_COLOR,
  },
  body: {
    width: 3,
    height: 10,
    backgroundColor: RUNNER_COLOR,
    alignSelf: 'center',
    borderRadius: 1.5,
    position: 'relative',
  },
  armLeft: {
    position: 'absolute',
    top: 1,
    left: -3,
    width: 3,
    height: 8,
    backgroundColor: RUNNER_COLOR,
    borderRadius: 1.5,
    transformOrigin: 'top',
  },
  armRight: {
    position: 'absolute',
    top: 1,
    right: -3,
    width: 3,
    height: 8,
    backgroundColor: RUNNER_COLOR,
    borderRadius: 1.5,
    transformOrigin: 'top',
  },
  legContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 1,
  },
  leg: {
    width: 3,
    height: 10,
    backgroundColor: RUNNER_COLOR,
    borderRadius: 1.5,
    transformOrigin: 'top',
  },
});

const STAGES = [
  { at: 0, text: '서버에 영상 업로드 중...' },
  { at: 20, text: 'AI 관절 추출 중...' },
  { at: 40, text: '전처리 및 필터 적용 중...' },
  { at: 60, text: '3대 지표 계산 중...' },
  { at: 80, text: '스켈레톤 렌더링 중...' },
  { at: 90, text: '코칭 메시지 생성 중...' },
];

export default function AnalyzingScreen() {
  const router = useRouter();
  const { videoUri, setCurrentAnalysis } = useApp();
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState(STAGES[0].text);
  const [error, setError] = useState<string | null>(null);
  const analyzingRef = useRef(false);

  const [debugInfo, setDebugInfo] = useState('');

  useEffect(() => {
    if (!videoUri || analyzingRef.current) return;
    analyzingRef.current = true;

    setDebugInfo(`videoUri: ${videoUri}\nbaseUrl: ${require('@/services/api').getApiBaseUrl()}`);

    let fakeProgress = 0;
    const progressInterval = setInterval(() => {
      fakeProgress = Math.min(fakeProgress + 1, 95);
      setProgress(fakeProgress);
      const matched = STAGES.filter(s => s.at <= fakeProgress).pop();
      if (matched) setStage(matched.text);
    }, 300);

    analyzeVideo(videoUri)
      .then(result => {
        clearInterval(progressInterval);
        setProgress(100);
        setStage('분석 완료!');
        setCurrentAnalysis(result);
        setTimeout(() => router.replace('/result'), 500);
      })
      .catch(err => {
        clearInterval(progressInterval);
        setError(err.message);
        setDebugInfo(prev => prev + `\n\nERROR: ${err.message}\n\nStack: ${err.stack || 'none'}`);
      });

    return () => clearInterval(progressInterval);
  }, [videoUri, setCurrentAnalysis, router]);

  if (error) {
    return (
      <View style={s.container}>
        <View style={[s.content, { width: '100%' }]}>
          <Text style={[s.title, { color: colors.danger }]}>분석 실패</Text>
          <Text style={{ fontSize: 14, color: colors.labelStrong, marginTop: 12, textAlign: 'center' }}>{error}</Text>
          <View style={{ marginTop: 20, padding: 12, backgroundColor: '#f0f0f0', borderRadius: 8, width: '100%' }}>
            <Text style={{ fontSize: 10, fontFamily: 'monospace', color: '#333' }} selectable>{debugInfo}</Text>
          </View>
          <TouchableOpacity style={{ marginTop: 20, padding: 14, backgroundColor: colors.labelStrong, borderRadius: 12 }} onPress={() => router.replace('/')}>
            <Text style={{ color: '#fff', fontWeight: '700' }}>돌아가기</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={s.container}>
      <View style={s.content}>
        <ActivityIndicator size="large" color={colors.skeleton} />
        <Text style={s.title}>분석 중</Text>
        <Text style={s.stage}>{stage}</Text>

        <View style={s.progressArea}>
          <RunningPerson progress={progress} />
          <View style={s.progressTrack}>
            <View style={[s.progressFill, { width: `${progress}%` }]} />
          </View>
        </View>
        <Text style={s.percent}>{progress}%</Text>

        <Text style={s.hint}>약 30~80초 소요됩니다</Text>
        <Text style={{ fontSize: 9, color: colors.labelAssist, marginTop: 12 }} selectable>{debugInfo}</Text>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1, backgroundColor: colors.bgNormal,
    justifyContent: 'center', alignItems: 'center',
  },
  content: { alignItems: 'center', paddingHorizontal: 40 },
  title: { fontSize: 22, fontWeight: '700', color: colors.labelStrong, marginTop: 24 },
  stage: { fontSize: 14, color: colors.labelNeutral, fontWeight: '600', marginTop: 8 },
  progressArea: {
    width: 240, marginTop: 24, position: 'relative' as const,
    paddingTop: 36,
  },
  progressTrack: {
    width: 240, height: 6, borderRadius: 3,
    backgroundColor: colors.cool96, overflow: 'hidden',
  },
  progressFill: { height: '100%', borderRadius: 3, backgroundColor: colors.skeleton },
  percent: { fontSize: 14, fontFamily: 'monospace', fontWeight: '700', color: colors.labelStrong, marginTop: 8 },
  hint: { fontSize: 12, color: colors.labelAssist, marginTop: 24 },
});
