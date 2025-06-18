
import React, { useState } from 'react';
import { PeriodLog } from '../types';
import { PlusCircleIcon } from './icons/PlusCircleIcon';
import { TrashIcon } from './icons/TrashIcon';
import { formatISODate, parseISODate } from '../services/dateUtils';

interface CycleFormProps {
  addPeriodLog: (startDate: string, endDate: string) => void;
  deletePeriodLog: (id: string) => void;
  periodLogs: PeriodLog[];
}

export const CycleForm: React.FC<CycleFormProps> = ({ addPeriodLog, periodLogs, deletePeriodLog }) => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showForm, setShowForm] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (startDate && endDate) {
      addPeriodLog(startDate, endDate);
      setStartDate('');
      setEndDate('');
      setShowForm(false);
    } else {
      alert('Please select both start and end dates.');
    }
  };

  const today = formatISODate(new Date());

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-bloom-text-dark">Log Period</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="p-2 rounded-full hover:bg-bloom-secondary/30 text-bloom-primary transition-colors"
          aria-label={showForm ? "Close period log form" : "Open form to add new period"}
          aria-expanded={showForm}
        >
          <PlusCircleIcon className="w-8 h-8" />
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="space-y-4 mb-6">
          <div>
            <label htmlFor="startDate" className="block text-sm font-medium text-bloom-text-light mb-1">
              Start Date
            </label>
            <input
              type="date"
              id="startDate"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              max={today}
              className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-bloom-primary focus:border-bloom-primary transition-colors"
              required
              aria-required="true"
            />
          </div>
          <div>
            <label htmlFor="endDate" className="block text-sm font-medium text-bloom-text-light mb-1">
              End Date
            </label>
            <input
              type="date"
              id="endDate"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              min={startDate || undefined} // End date cannot be before start date
              max={today}
              className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-bloom-primary focus:border-bloom-primary transition-colors"
              required
              aria-required="true"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-bloom-primary text-white py-3 px-4 rounded-lg font-semibold hover:bg-pink-500 transition-colors shadow-md"
          >
            Save Period
          </button>
        </form>
      )}
      
      {periodLogs.length > 0 && (
        <div>
          <h3 className="text-lg font-medium text-bloom-text-dark mb-2" id="logged-periods-heading">Logged Periods:</h3>
          <ul className="max-h-48 overflow-y-auto space-y-2 pr-2" aria-labelledby="logged-periods-heading">
            {periodLogs.map(log => (
              <li 
                key={log.id} 
                className="flex justify-between items-center bg-bloom-bg p-3 rounded-md shadow-sm hover:bg-bloom-secondary/20 transition-colors"
              >
                <span className="text-sm text-bloom-text-light">
                  {formatISODate(parseISODate(log.startDate))} to {formatISODate(parseISODate(log.endDate))}
                </span>
                <button 
                  onClick={() => deletePeriodLog(log.id)} 
                  className="text-red-500 hover:text-red-700 transition-colors p-1"
                  aria-label={`Delete period log from ${formatISODate(parseISODate(log.startDate))} to ${formatISODate(parseISODate(log.endDate))}`}
                >
                  <TrashIcon className="w-5 h-5" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
