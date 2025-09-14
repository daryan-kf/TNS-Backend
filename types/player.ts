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

export interface Team {
  team_id: string;
  name: string;
  organisation: string;
  created: string;
  modified: string;
}

export interface TeamPlayer {
  team_id: string;
  player_id: string;
  player_number: number;
  first_name: string;
  last_name: string;
  role: string;
  status: string;
  created: string;
  modified: string;
}

export type TrainingSessionRow = {
  team_id: string;
  training_id: string;
  player_id: string;
  player_session_id: string;
  start_time: string;
  stop_time: string;
  duration_ms: number;
  distance_meters: number;
  calories: number;
  training_load: number;
  cardio_load: number;
  muscle_load: number;
  heart_rate_avg: number;
  heart_rate_max: number;
  sprints: number;
  run_distance_m: number;
  walk_distance_m: number;
  rmssd_ms: number;
  sdnn_ms: number;
  pnn50: number;
  created_at: string;
};
