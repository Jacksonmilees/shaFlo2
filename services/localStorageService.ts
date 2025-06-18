import { PeriodLog, MoodLog } from '../types';
import { LOCAL_STORAGE_PERIOD_LOGS_KEY, LOCAL_STORAGE_MOOD_LOGS_KEY } from '../constants';

export const loadPeriodLogs = (): PeriodLog[] => {
  try {
    const logsJson = localStorage.getItem(LOCAL_STORAGE_PERIOD_LOGS_KEY);
    if (logsJson) {
      const logs = JSON.parse(logsJson) as PeriodLog[];
      // Validate data structure somewhat
      return logs.filter(log => log.id && log.startDate && log.endDate);
    }
  } catch (error) {
    console.error("Failed to load period logs from localStorage:", error);
  }
  return [];
};

export const savePeriodLogs = (logs: PeriodLog[]): void => {
  try {
    localStorage.setItem(LOCAL_STORAGE_PERIOD_LOGS_KEY, JSON.stringify(logs));
  } catch (error) {
    console.error("Failed to save period logs to localStorage:", error);
  }
};

export const loadMoodLogs = (): MoodLog[] => {
  try {
    const logsJson = localStorage.getItem(LOCAL_STORAGE_MOOD_LOGS_KEY);
    if (logsJson) {
      const logs = JSON.parse(logsJson) as MoodLog[];
      // Validate data structure: id (date YYYY-MM-DD), date, mood (emoji string)
      return logs.filter(log => log.id && log.date && log.mood);
    }
  } catch (error) {
    console.error("Failed to load mood logs from localStorage:", error);
  }
  return [];
};

export const saveMoodLogs = (logs: MoodLog[]): void => {
  try {
    localStorage.setItem(LOCAL_STORAGE_MOOD_LOGS_KEY, JSON.stringify(logs));
  } catch (error) {
    console.error("Failed to save mood logs to localStorage:", error);
  }
};