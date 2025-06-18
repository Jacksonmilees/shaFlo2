export interface PeriodLog {
  id: string;
  startDate: string; // ISO string YYYY-MM-DD
  endDate: string;   // ISO string YYYY-MM-DD
}

export interface CyclePrediction {
  averageCycleLength: number;
  averagePeriodLength: number;
  nextPeriodStartDate: string | null; // ISO string YYYY-MM-DD
  ovulationDate: string | null;       // ISO string YYYY-MM-DD
  fertileWindow: {
    start: string; // ISO string YYYY-MM-DD
    end: string;   // ISO string YYYY-MM-DD
  } | null;
  warning?: string; // Optional warning message (e.g., insufficient data)
}

export interface DayInfo {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  isPeriodDay: boolean;
  isFertileDay: boolean;
  isOvulationDay: boolean;
  moodEmoji?: string; // Optional: emoji string of the logged mood for this day
}

export interface WellnessMessage {
  id: string;
  sender: 'user' | 'gemini';
  text: string;
  timestamp: number;
}

export interface MoodLog {
  id: string; // Typically the date YYYY-MM-DD
  date: string; // ISO string YYYY-MM-DD, represents the day the mood is for
  mood: string; // The emoji representing the mood
  note?: string; // Optional personal note
}

export interface MoodOption {
  key: string; // A unique key for the mood (e.g., 'happy', 'calm')
  emoji: string; // The emoji character
  label: string; // User-friendly label (e.g., 'Happy', 'Calm')
}

export enum CyclePhase {
  MENSTRUAL = 'MENSTRUAL',
  FOLLICULAR = 'FOLLICULAR',
  OVULATORY = 'OVULATORY',
  LUTEAL = 'LUTEAL'
}

declare global {
  interface NotificationOptions {
    vibrate?: number[];
  }
}