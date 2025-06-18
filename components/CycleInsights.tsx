
import React from 'react';
import { CyclePrediction } from '../types';
import { parseISODate } from '../services/dateUtils';

interface CycleInsightsProps {
  prediction: CyclePrediction | null;
}

const formatDateDisplay = (isoDateString: string | null): string => {
  if (!isoDateString) return "N/A";
  const date = parseISODate(isoDateString);
  return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
};

export const CycleInsights: React.FC<CycleInsightsProps> = ({ prediction }) => {
  if (!prediction) {
    return <div className="bg-white p-6 rounded-xl shadow-lg text-center text-bloom-text-light">Loading insights...</div>;
  }

  const { 
    averageCycleLength, 
    averagePeriodLength, 
    nextPeriodStartDate, 
    ovulationDate, 
    fertileWindow,
    warning 
  } = prediction;

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg space-y-4">
      <h2 className="text-xl font-semibold text-bloom-text-dark text-center mb-4">Your Cycle Insights</h2>
      
      {warning && (
        <div className="p-3 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 rounded-md text-sm">
          <p>{warning}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InsightCard title="Next Period" value={formatDateDisplay(nextPeriodStartDate)} color="bg-bloom-period" />
        <InsightCard title="Predicted Ovulation" value={formatDateDisplay(ovulationDate)} color="bg-bloom-ovulation" />
      </div>
      
      <div className="bg-bloom-fertile/20 p-4 rounded-lg">
        <h3 className="font-semibold text-bloom-fertile text-center">Predicted Fertile Window</h3>
        {fertileWindow ? (
          <p className="text-center text-bloom-text-light">
            {formatDateDisplay(fertileWindow.start)} - {formatDateDisplay(fertileWindow.end)}
          </p>
        ) : (
          <p className="text-center text-bloom-text-light">N/A</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
        <InsightCard title="Avg. Cycle Length" value={`${averageCycleLength} days`} small />
        <InsightCard title="Avg. Period Length" value={`${averagePeriodLength} days`} small />
      </div>
    </div>
  );
};

interface InsightCardProps {
  title: string;
  value: string;
  color?: string;
  small?: boolean;
}

const InsightCard: React.FC<InsightCardProps> = ({ title, value, color, small }) => (
  <div className={`p-4 rounded-lg shadow ${color ? color + ' text-white' : 'bg-bloom-secondary/20 text-bloom-text-dark'}`}>
    <h4 className={`${small ? 'text-sm' : 'text-md'} font-medium ${color ? 'opacity-90' : 'text-bloom-text-light'}`}>{title}</h4>
    <p className={`${small ? 'text-lg' : 'text-xl'} font-semibold`}>{value}</p>
  </div>
);

