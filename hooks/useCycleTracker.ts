import { useState, useEffect, useCallback } from 'react';
import { PeriodLog, CyclePrediction, MoodLog } from '../types';
import { loadPeriodLogs, savePeriodLogs, loadMoodLogs, saveMoodLogs } from '../services/localStorageService';
import { calculateCyclePredictions } from '../services/cycleCalculationService';

export const useCycleTracker = () => {
  const [periodLogs, setPeriodLogs] = useState<PeriodLog[]>([]);
  const [moodLogs, setMoodLogs] = useState<MoodLog[]>([]);
  const [cyclePrediction, setCyclePrediction] = useState<CyclePrediction | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initialPeriodLogs = loadPeriodLogs();
    setPeriodLogs(initialPeriodLogs);
    const initialMoodLogs = loadMoodLogs();
    setMoodLogs(initialMoodLogs);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (!isLoading) {
      const prediction = calculateCyclePredictions(periodLogs);
      setCyclePrediction(prediction);
      savePeriodLogs(periodLogs); 
      saveMoodLogs(moodLogs); // Save mood logs whenever they change
    }
  }, [periodLogs, moodLogs, isLoading]); // Added moodLogs to dependencies

  const addPeriodLog = useCallback((startDate: string, endDate: string) => {
    if (!startDate || !endDate) {
      alert("Please provide both start and end dates.");
      return;
    }
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (start > end) {
      alert("Start date cannot be after end date.");
      return;
    }

    const newLog: PeriodLog = {
      id: new Date().toISOString(), 
      startDate,
      endDate,
    };
    
    const isOverlapping = periodLogs.some(log => {
        const logStart = new Date(log.startDate);
        const logEnd = new Date(log.endDate);
        return (start <= logEnd && end >= logStart);
    });

    if (isOverlapping) {
        alert("The new period entry overlaps with an existing one. Please check your dates.");
        return;
    }

    setPeriodLogs(prevLogs => {
      const updatedLogs = [...prevLogs, newLog];
      updatedLogs.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
      return updatedLogs;
    });
  }, [periodLogs]);

  const deletePeriodLog = useCallback((id: string) => {
    setPeriodLogs(prevLogs => prevLogs.filter(log => log.id !== id));
  }, []);

  const addMoodLog = useCallback((date: string, mood: string, note?: string) => {
    setMoodLogs(prevLogs => {
      const existingLogIndex = prevLogs.findIndex(log => log.date === date);
      // Mood is stored as the emoji string. ID is the date.
      const newLog: MoodLog = { id: date, date, mood, note: note?.trim() === '' ? undefined : note };
      
      let updatedLogs;
      if (existingLogIndex > -1) {
        updatedLogs = [...prevLogs];
        updatedLogs[existingLogIndex] = newLog;
      } else {
        updatedLogs = [...prevLogs, newLog];
      }
      // Sort logs by date after adding/updating
      updatedLogs.sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      return updatedLogs;
    });
  }, []);

  const getMoodLogForDate = useCallback((date: string): MoodLog | undefined => {
    return moodLogs.find(log => log.date === date);
  }, [moodLogs]);

  return {
    periodLogs,
    cyclePrediction,
    addPeriodLog,
    deletePeriodLog,
    moodLogs,
    addMoodLog,
    getMoodLogForDate,
    isLoading
  };
};