export type MetricStatus = 'good' | 'danger' | 'warn';

export interface DangerTimestamp {
  time_sec: number;
  type: 'heel_strike' | 'stiff_knee' | 'over_stride' | 'high_oscillation';
  color: 'red';
}

export interface QualityWarning {
  code: string;
  message_ko: string;
}

export interface AnalysisResult {
  analysis_id: string;
  summary: {
    total_frames: number;
    duration_sec: number;
    fps: number;
    total_strikes: number;
    left_strikes: number;
    right_strikes: number;
    danger_count: number;
    cadence_spm: number;
  };
  metrics: {
    knee_flexion: {
      avg_angle: number;
      left_avg: number;
      right_avg: number;
      status_counts: Record<string, number>;
      per_strike: Array<{ frame: number; angle: number; status: string; side: string }>;
    };
    foot_strike: {
      status_counts: Record<string, number>;
      per_strike: Array<{ frame: number; angle: number; status: string; side: string }>;
    };
    overstriding: {
      avg_distance: number;
      status_counts: Record<string, number>;
      per_strike: Array<{ frame: number; distance: number; status: string; side: string }>;
    };
    vertical_oscillation: {
      avg_value: number;
      left_avg: number;
      right_avg: number;
      status: string;
      per_stride: Array<{ start_frame: number; amplitude: number; status: string; side: string }>;
    };
  };
  asymmetry: {
    is_warning: boolean;
    knee_angle_ratio: number | null;
    oscillation_ratio: number | null;
    strike_count_ratio: number | null;
  };
  danger_timestamps: DangerTimestamp[];
  confidence: 'high' | 'medium' | 'low';
  warnings: QualityWarning[];
  coach_message: string;
  rendered_video_url: string;
  csv_report_url: string;
}

export interface Member {
  id: string;
  name: string;
  createdAt: string;
  analyses: AnalysisResult[];
}
