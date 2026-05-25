import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { AnalysisResult } from '@/types/analysis';

function getDefaultUrl(): string {
  const debuggerHost = Constants.expoGoConfig?.debuggerHost
    ?? Constants.expoConfig?.hostUri;
  if (debuggerHost) {
    const ip = debuggerHost.split(':')[0];
    return `http://${ip}:8000`;
  }
  if (Platform.OS === 'web') return 'http://localhost:8000';
  return 'http://192.168.55.148:8000';
}

let _baseUrl = getDefaultUrl();

export function setApiBaseUrl(url: string) {
  _baseUrl = url.replace(/\/+$/, '');
}

export function getApiBaseUrl(): string {
  return _baseUrl;
}

async function uploadWeb(fileUri: string): Promise<Response> {
  const blob = await fetch(fileUri).then(r => r.blob());
  const formData = new FormData();
  formData.append('file', blob, 'recording.mp4');
  return fetch(`${_baseUrl}/analyze`, { method: 'POST', body: formData });
}

async function uploadNative(fileUri: string): Promise<Response> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', `${_baseUrl}/analyze`);
    xhr.timeout = 300_000; // 5분
    xhr.onload = () => {
      resolve(new Response(xhr.responseText, {
        status: xhr.status,
        headers: { 'Content-Type': 'application/json' },
      }));
    };
    xhr.onerror = () => reject(new Error('네트워크 오류'));
    xhr.ontimeout = () => reject(new Error('서버 응답 시간 초과 (5분)'));

    const formData = new FormData();
    formData.append('file', {
      uri: fileUri,
      type: 'video/mp4',
      name: 'recording.mp4',
    } as any);
    xhr.send(formData);
  });
}

export async function analyzeVideo(fileUri: string): Promise<AnalysisResult> {
  const resp = Platform.OS === 'web'
    ? await uploadWeb(fileUri)
    : await uploadNative(fileUri);

  if (!resp.ok) {
    let msg = '분석 중 오류가 발생했습니다.';
    try {
      const err = await resp.json();
      msg = typeof err.detail === 'string'
        ? err.detail
        : err.detail?.message_ko || msg;
    } catch {}
    throw new Error(`[${resp.status}] ${msg}`);
  }

  return resp.json();
}

export function videoUrl(analysisId: string): string {
  return `${_baseUrl}/results/${analysisId}/video`;
}

export function csvUrl(analysisId: string): string {
  return `${_baseUrl}/results/${analysisId}/csv`;
}

export async function checkHealth(): Promise<{ status: string; worker: string }> {
  const resp = await fetch(`${_baseUrl}/health`, { signal: AbortSignal.timeout(5000) });
  return resp.json();
}
