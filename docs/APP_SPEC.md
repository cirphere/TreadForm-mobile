# TreadForm Mobile App Spec

## 1. 기능 목록 (구현 vs 미구현)

### 구현 완료

| 기능 | 위치 | 상태 |
|------|------|------|
| 러너/트레이너 모드 전환 | index.tsx | 동작 |
| 갤러리에서 영상 선택 | index.tsx, camera.tsx | 동작 |
| 영상 업로드 + 분석 요청 | api.ts → POST /analyze | 동작 |
| 분석 중 진행률 UI (러닝맨 애니메이션) | analyzing.tsx | 동작 (가짜 진행률) |
| 결과 화면 3탭 (종합/타임라인/리포트) | result.tsx | 동작 |
| 스켈레톤 영상 재생 | result.tsx (expo-video) | 동작 |
| 3대 지표 타일 (무릎/착지/진폭) | MetricTile | 동작 |
| 위험 구간 타임라인 + 영상 시킹 | DangerTimeline | 동작 |
| AI 코칭 메시지 표시 | CoachingCard, 리포트탭 | 동작 |
| 신뢰도/경고 표시 | 리포트탭 | 동작 |
| 회원 추가 (로컬) | add-member.tsx | 동작 (서버 미연동) |
| 회원 목록 표시 | index.tsx TrainerHome | 동작 (로컬 state) |
| 서버 헬스체크 | api.ts checkHealth | 동작 |

### 미구현 / 플레이스홀더

| 기능 | 현재 상태 | 비고 |
|------|-----------|------|
| 카메라 녹화 | Alert만 표시 | "네이티브 빌드 필요" 안내 |
| 회원 관리 (서버 연동) | 로컬 state만 사용 | 백엔드 POST/GET /api/members 존재 |
| 회원별 분석 히스토리 | 미구현 | 백엔드 GET /members/{id}/history 존재 |
| 비포/애프터 비교 | 미구현 | 트레이너 모드 핵심 기능 |
| CSV 다운로드 | 버튼만 존재, 동작 없음 | GET /results/{id}/csv 존재 |
| 공유 기능 | 버튼만 존재, 동작 없음 | |
| 오버스트라이딩 타일 | 데이터는 있으나 UI 미노출 | 3타일만 표시 중 |
| 비대칭 시각화 | 데이터만 존재 | asymmetry 객체 미표시 |
| 서버 URL 설정 UI | AppContext에 state만 존재 | 사용자가 변경할 UI 없음 |
| 온보딩/튜토리얼 | 미구현 | |
| 로그인/인증 | 미구현 | |
| 설정 화면 | 미구현 | |
| 다크 모드 | 훅만 존재, 적용 안됨 | use-color-scheme.ts 존재 |
| 분석 히스토리 (러너) | 미구현 | 내 분석 기록 목록 |
| 에러 재시도 | 분석 실패 시 "돌아가기"만 | |

---

## 2. 화면별 스펙

### 2-1. 홈 (index.tsx)

**모드: 러너**
- 데이터: 없음 (정적 텍스트)
- 인터랙션:
  - [영상 촬영하기] → camera 화면
  - [갤러리에서 선택] → ImagePicker → analyzing 화면
  - 모드 토글 → 트레이너로 전환
- 미구현: 내 분석 히스토리 리스트

**모드: 트레이너**
- 데이터: members[] (이름, 분석 횟수)
- 인터랙션:
  - 회원 카드 탭 → selectMember → camera 화면
  - [+ 회원 추가하고 측정] → add-member 화면
  - 모드 토글 → 러너로 전환
- 미구현: 서버에서 회원 목록 로드, 회원별 히스토리 진입

### 2-2. 카메라 (camera.tsx)

- 데이터: recording 상태, elapsed 시간
- 인터랙션:
  - 녹화 버튼 → 타이머 시작 (10초 제한, 실제 녹화 미구현)
  - [갤러리] → ImagePicker → analyzing 화면
  - [전환] → 동작 없음
  - [<] → 뒤로가기
- UI 요소: 트레드밀 가이드 오버레이 (벨트 라인, 힙 박스)
- 미구현: 실제 카메라 프리뷰 + 녹화, 전후면 카메라 전환

### 2-3. 분석 중 (analyzing.tsx)

- 데이터: videoUri (AppContext)
- API: analyzeVideo(videoUri) → POST /analyze (동기, 30~80초)
- 인터랙션: 없음 (대기 화면), 에러 시 [돌아가기]
- UI 요소:
  - ActivityIndicator
  - 러닝맨 애니메이션 (팔다리 회전)
  - 프로그레스 바 (0~100%)
  - 단계 텍스트 (6단계)
  - 디버그 정보 (videoUri, baseUrl, 에러)
- 완료 시: setCurrentAnalysis → result 화면 (500ms 딜레이)
- 미구현: 취소 버튼, 실제 서버 진행률 연동

### 2-4. 결과 (result.tsx)

**탭: 종합 (overview)**
- 데이터: currentAnalysis
- UI 요소:
  - 스켈레톤 영상 (VideoView, 루프 재생)
  - 3개 MetricTile (무릎 굴곡, 발 착지, 수직 진폭)
  - CoachingCard (코칭 메시지 첫 줄 + 위험 카운트)
- 인터랙션:
  - CoachingCard 탭 → 리포트 탭으로 전환

**탭: 타임라인 (timeline)**
- 데이터: danger_timestamps[], duration_sec
- UI 요소:
  - 스켈레톤 영상
  - DangerTimeline (트랙 위 빨간 마커 + 리스트)
- 인터랙션:
  - 마커/리스트 항목 탭 → 해당 시간으로 영상 시킹

**탭: 리포트 (report)**
- 데이터: summary, confidence, warnings[], coach_message
- UI 요소:
  - 분석 요약 카드 (ID, 영상 길이, 케이던스, 총 착지, 신뢰도, 위험 감지)
  - 경고 카드 (warnings)
  - AI 코칭 메시지 전문
  - [CSV 리포트 다운로드] 버튼
- 미구현: CSV 다운로드 동작, 공유 버튼 동작

**공통**
- 헤더: [<] 뒤로, 모드 표시 (회원 분석/자가 측정), [공유]
- 3탭 바: 종합 | 타임라인 | 리포트

### 2-5. 회원 추가 (add-member.tsx)

- 데이터: name (TextInput)
- 인터랙션:
  - 이름 입력 → [등록하고 측정 시작] → addMember(로컬) → selectMember → camera
  - [<] → 뒤로가기
- 미구현: 서버 POST /api/members 연동

---

## 3. 피그마용 구조

### 3-1. 화면 플로우

```
홈 (러너)
  ├─ [영상 촬영하기] ──→ 카메라
  │                        ├─ [녹화] ──→ 분석 중 ──→ 결과
  │                        └─ [갤러리] ──→ 분석 중 ──→ 결과
  └─ [갤러리에서 선택] ──→ 분석 중 ──→ 결과

홈 (트레이너)
  ├─ [회원 카드] ──→ 카메라 ──→ 분석 중 ──→ 결과
  └─ [+ 회원 추가] ──→ 회원 등록 ──→ 카메라

결과
  ├─ [<] ──→ 홈
  ├─ 종합탭 ──→ 코칭카드 탭 ──→ 리포트탭
  └─ 타임라인탭 ──→ 마커 탭 ──→ 영상 시킹
```

### 3-2. 컴포넌트 리스트

| 컴포넌트 | Props | 용도 |
|----------|-------|------|
| ModeToggle | mode, onChange | 러너/트레이너 전환 |
| MetricTile | tag, name, value, status, statusLabel | 지표 카드 (K/S/O) |
| CoachingCard | message, dangerCount, onPress | 코칭 요약 |
| DangerTimeline | timestamps[], durationSec, onSeek | 위험 구간 시각화 |
| RunningPerson | progress | 분석 중 러닝맨 애니메이션 |

### 3-3. 디자인 토큰

**컬러**
| 이름 | 값 | 용도 |
|------|-----|------|
| danger | #FF3D3D | 위험 (heel_strike, stiff_knee 등) |
| warn | #F5A623 | 주의 (borderline, forefoot) |
| good | #1FBA66 | 정상 |
| skeleton | #5BE5C6 | 브랜드 포인트, 프로그레스 바 |
| labelStrong | #000000 | 제목, 강조 텍스트 |
| labelNeutral | rgba(46,47,51,0.88) | 본문 |
| labelAssist | rgba(55,56,60,0.28) | 힌트, 보조 텍스트 |
| bgNormal | #FFFFFF | 배경 |
| cam | #0B0D10 | 카메라 배경 |
| lineAlt | rgba(112,115,124,0.08) | 카드 테두리 |

**타이포그래피 (현재 시스템 폰트)**
| 용도 | size | weight |
|------|------|--------|
| Hero 타이틀 | 30 | 700 |
| 섹션 타이틀 | 22 | 700 |
| 카드 타이틀 | 16 | 700 |
| 본문 | 14~15 | 600 |
| 보조 | 12~13 | 600 |
| 힌트 | 10~11 | 600 |
| 수치 (monospace) | 18 | 700 |

**간격/라운딩**
| 요소 | borderRadius |
|------|-------------|
| 카드 | 12 |
| 큰 버튼 | 14 |
| 인풋 | 12 |
| 토글 | 999 (pill) |
| 아바타 | 20 (원형) |

### 3-4. 미구현 화면 (피그마에서 추가 필요)

1. **설정** — 서버 URL 입력, 다크모드 토글
2. **회원 상세/히스토리** — 분석 기록 리스트, 비포/애프터 그래프
3. **온보딩** — 촬영 가이드 (측면, 전신, 트레드밀)
4. **분석 히스토리 (러너)** — 내 분석 기록 리스트
5. **지표 상세** — MetricTile 탭 시 드릴다운 (per_strike 차트)
6. **비대칭 카드** — 좌우 비교 시각화
