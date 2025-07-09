export interface PlayerSession {
  timestamp: string;
  duration_min: number;
  avg_hr: number;
  max_hr: number;
  hrv_rmssd: number;
  fatigue_score: number;
  load_score: number;
  movement_intensity_score: number;
  hr_zones: HrZones;
}

export interface HrZones {
  zone1: number;
  zone2: number;
  zone3: number;
  zone4: number;
  zone5: number;
}

export interface PlayerWeeklySummary {
  total_sessions: number;
  avg_fatigue_score: number;
  avg_load_score: number;
  recovery_trend: string;
}

export interface PlayerRecoveryStatus {
  score: number;
  trend: string;
}

export interface Player {
  player_id: string;
  name: string;
  position?: string;
  team?: string;
  image?: string;
  latest_session: PlayerSession;
  weekly_summary: PlayerWeeklySummary;
  recovery_status: PlayerRecoveryStatus;
}
