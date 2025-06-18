import { MoodOption } from './types';

export const LOCAL_STORAGE_PERIOD_LOGS_KEY = 'sharleneCycleBloom_periodLogs';
export const LOCAL_STORAGE_MOOD_LOGS_KEY = 'shaflo_moodLogs'; // New key for mood logs

export const DEFAULT_CYCLE_LENGTH = 28; // days
export const DEFAULT_PERIOD_LENGTH = 5; // days
export const OVULATION_OFFSET_FROM_NEXT_PERIOD = -14; // days
export const FERTILE_WINDOW_START_OFFSET_FROM_OVULATION = -5; // days
export const FERTILE_WINDOW_END_OFFSET_FROM_OVULATION = 1; // days
export const MIN_CYCLES_FOR_RELIABLE_PREDICTION = 2;

export const GEMINI_API_KEY_AVAILABLE = typeof process.env.GEMINI_API_KEY === 'string' && process.env.GEMINI_API_KEY.length > 0;
export const GEMINI_MODEL_TEXT = 'gemini-2.5-flash-preview-04-17';

export const MOOD_OPTIONS: MoodOption[] = [
  { key: 'happy', emoji: '😊', label: 'Happy' },
  { key: 'calm', emoji: '😌', label: 'Calm' },
  { key: 'energetic', emoji: '⚡️', label: 'Energetic' },
  { key: 'grateful', emoji: '🙏', label: 'Grateful' },
  { key: 'motivated', emoji: '🚀', label: 'Motivated' },
  { key: 'sad', emoji: '😢', label: 'Sad' },
  { key: 'tired', emoji: '😴', label: 'Tired' },
  { key: 'anxious', emoji: '😟', label: 'Anxious' },
  { key: 'irritable', emoji: '😠', label: 'Irritable' },
  { key: 'neutral', emoji: '😐', label: 'Neutral' },
];