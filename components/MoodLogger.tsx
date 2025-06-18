import React, { useState, useEffect } from 'react';
import { MoodLog } from '../types';
import { MOOD_OPTIONS } from '../constants';
import { formatISODate, parseISODate } from '../services/dateUtils.ts'; // For today's date

interface MoodLoggerProps {
  todayMoodLog?: MoodLog; // Mood log for the current day
  addMoodLog: (date: string, mood: string, note?: string) => void;
  currentDate: string; // ISO string YYYY-MM-DD, should be today
}

export const MoodLogger: React.FC<MoodLoggerProps> = ({ todayMoodLog, addMoodLog, currentDate }) => {
  const [selectedMood, setSelectedMood] = useState<string>(todayMoodLog?.mood || '');
  const [note, setNote] = useState<string>(todayMoodLog?.note || '');

  useEffect(() => {
    // Update local state if the prop for today's mood log changes
    // This can happen if logs are loaded/updated after initial render
    setSelectedMood(todayMoodLog?.mood || '');
    setNote(todayMoodLog?.note || '');
  }, [todayMoodLog]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMood) {
      alert("Please select a mood, my love.");
      return;
    }
    addMoodLog(currentDate, selectedMood, note);
    // Optional: Add a gentle confirmation message or effect here
  };
  
  const currentDisplayDate = parseISODate(currentDate);


  return (
    <div className="bg-white p-6 rounded-xl shadow-lg">
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