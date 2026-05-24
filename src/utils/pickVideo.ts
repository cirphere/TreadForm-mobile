import { Alert, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

const MIN_FPS = 60;

export async function pickVideoFromGallery(): Promise<string | null> {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['videos'],
    quality: 1,
  });

  if (result.canceled || !result.assets[0]) return null;

  const uri = result.assets[0].uri;

  if (Platform.OS !== 'web') {
    try {
      const { getVideoInfoAsync } = await import('expo-video-metadata');
      const info = await getVideoInfoAsync(uri);

      if (info.fps < MIN_FPS) {
        Alert.alert(
          '영상 요건 미충족',
          `현재 ${Math.round(info.fps)}fps — ${MIN_FPS}fps 이상의 영상만 분석 가능합니다.\n\n카메라 설정에서 60fps로 변경 후 다시 촬영해주세요.`,
        );
        return null;
      }
    } catch {
      // 메타데이터 읽기 실패 시 서버에서 검증
    }
  }

  return uri;
}
