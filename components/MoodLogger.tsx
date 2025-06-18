import React, { useState, useEffect, useCallback } from 'react';
import { MoodLog } from '../types';
import { MOOD_OPTIONS } from '../constants';
import { parseISODate } from '../services/dateUtils';

interface MoodLoggerProps {
  todayMoodLog?: MoodLog;
  addMoodLog: (date: string, mood: string, note?: string) => void;
  currentDate: string;
}

export const MoodLogger: React.FC<MoodLoggerProps> = ({ todayMoodLog, addMoodLog, currentDate }) => {
  const [selectedMood, setSelectedMood] = useState<string>(todayMoodLog?.mood || '');
  const [note, setNote] = useState<string>(todayMoodLog?.note || '');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmationTimeout, setConfirmationTimeout] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setSelectedMood(todayMoodLog?.mood || '');
    setNote(todayMoodLog?.note || '');
  }, [todayMoodLog]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (confirmationTimeout) {
        clearTimeout(confirmationTimeout);
      }
    };
  }, [confirmationTimeout]);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMood) {
      alert("Please select a mood, my love.");
      return;
    }

    // Clear any existing timeout
    if (confirmationTimeout) {
      clearTimeout(confirmationTimeout);
    }

    addMoodLog(currentDate, selectedMood, note);
    
    // Show confirmation
    setShowConfirmation(true);
    
    // Clear inputs if it's a new entry
    if (!todayMoodLog) {
      setSelectedMood('');
      setNote('');
    }
    
    // Set new timeout and store it
    const timeout = setTimeout(() => {
      setShowConfirmation(false);
      setConfirmationTimeout(null);
    }, 1500); // Reduced to 1.5 seconds for better UX

    setConfirmationTimeout(timeout);
  }, [selectedMood, note, currentDate, todayMoodLog, addMoodLog, confirmationTimeout]);
  
  const currentDisplayDate = parseISODate(currentDate);

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg relative overflow-hidden">
      {showConfirmation && (
        <div className="absolute inset-0 bg-green-50/90 flex items-center justify-center rounded-xl animate-fade-in z-10">
          <div className="text-center transform transition-all duration-300">
            <span className="text-4xl mb-2 block animate-bounce" role="img" aria-label="Success">✨</span>
            <p className="text-bloom-primary font-semibold">Mood saved successfully!</p>
          </div>
        </div>
      )}
      
      <h2 className="text-xl font-semibold text-bloom-text-dark mb-1">How are you feeling today, my dearest Sharlene?</h2>
      <p className="text-sm text-bloom-text-light mb-4">
        Logging for: <span className="font-medium">{currentDisplayDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', timeZone: 'UTC' })}</span>
      </p>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="mb-4">
          <label className="block text-sm font-medium text-bloom-text-light mb-2">Select your mood:</label>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
            {MOOD_OPTIONS.map(option => (
              <button
                key={option.key}
                type="button"
                onClick={() => setSelectedMood(option.emoji)}
                className={`p-3 rounded-lg border-2 text-center transition-all duration-150 flex flex-col items-center justify-center aspect-square
                            ${selectedMood === option.emoji 
                              ? 'border-bloom-primary bg-bloom-primary/20 ring-2 ring-bloom-primary' 
                              : 'border-gray-200 hover:border-bloom-secondary bg-gray-50/50 hover:bg-bloom-secondary/10'}
                            focus:outline-none focus:ring-2 focus:ring-bloom-accent/80`}
                aria-pressed={selectedMood === option.emoji}
                title={option.label}
              >
                <span className="text-3xl" role="img" aria-label={option.label}>{option.emoji}</span>
                <span className="block text-xs mt-1 text-bloom-text-light truncate w-full">{option.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label htmlFor="moodNote" className="block text-sm font-medium text-bloom-text-light mb-1">
            Add a little note (optional):
          </label>
          <textarea
            id="moodNote"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            placeholder="Any thoughts or feelings to share, sweetheart?"
            className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-1 focus:ring-bloom-primary focus:border-bloom-primary transition-colors"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-bloom-accent text-white py-3 px-4 rounded-lg font-semibold hover:bg-violet-700 transition-colors shadow-md disabled:bg-gray-400 disabled:cursor-not-allowed"
          disabled={!selectedMood}
        >
          {todayMoodLog ? 'Update Mood' : 'Save Mood'}
        </button>
      </form>
    </div>
  );
};