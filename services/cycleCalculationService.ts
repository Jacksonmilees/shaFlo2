
import { PeriodLog, CyclePrediction } from '../types';
import { 
  DEFAULT_CYCLE_LENGTH, 
  DEFAULT_PERIOD_LENGTH, 
  OVULATION_OFFSET_FROM_NEXT_PERIOD,
  FERTILE_WINDOW_START_OFFSET_FROM_OVULATION,
  FERTILE_WINDOW_END_OFFSET_FROM_OVULATION,
  MIN_CYCLES_FOR_RELIABLE_PREDICTION
} from '../constants';
import { parseISODate, formatISODate, addDays, differenceInDays } from './dateUtils';

export const calculateCyclePredictions = (logs: PeriodLog[]): CyclePrediction => {
  if (logs.length === 0) {
    return {
      averageCycleLength: DEFAULT_CYCLE_LENGTH,
      averagePeriodLength: DEFAULT_PERIOD_LENGTH,
      nextPeriodStartDate: null,
      ovulationDate: null,
      fertileWindow: null,
      warning: "Log your first period to get started!"
    };
  }

  // Sort logs by start date just in case
  const sortedLogs = [...logs].sort((a, b) => parseISODate(a.startDate).getTime() - parseISODate(b.startDate).getTime());

  let totalCycleLength = 0;
  let cycleCount = 0;
  for (let i = 1; i < sortedLogs.length; i++) {
    const prevStartDate = parseISODate(sortedLogs[i-1].startDate);
    const currStartDate = parseISODate(sortedLogs[i].startDate);
    totalCycleLength += differenceInDays(prevStartDate, currStartDate);
    cycleCount++;
  }
  const averageCycleLength = cycleCount > 0 ? Math.round(totalCycleLength / cycleCount) : DEFAULT_CYCLE_LENGTH;

  let totalPeriodLength = 0;
  sortedLogs.forEach(log => {
    const startDate = parseISODate(log.startDate);
    const endDate = parseISODate(log.endDate);
    totalPeriodLength += differenceInDays(startDate, endDate) + 1; // Inclusive
  });
  const averagePeriodLength = sortedLogs.length > 0 ? Math.round(totalPeriodLength / sortedLogs.length) : DEFAULT_PERIOD_LENGTH;
  
  const lastPeriod = sortedLogs[sortedLogs.length - 1];
  const lastPeriodStartDate = parseISODate(lastPeriod.startDate);
  
  const nextPeriodStartDate = addDays(lastPeriodStartDate, averageCycleLength);
  const ovulationDate = addDays(nextPeriodStartDate, OVULATION_OFFSET_FROM_NEXT_PERIOD);
  const fertileWindowStart = addDays(ovulationDate, FERTILE_WINDOW_START_OFFSET_FROM_OVULATION);
  const fertileWindowEnd = addDays(ovulationDate, FERTILE_WINDOW_END_OFFSET_FROM_OVULATION);

  let warning: string | undefined = undefined;
  if (cycleCount < MIN_CYCLES_FOR_RELIABLE_PREDICTION -1 && sortedLogs.length > 0) { // needs cycleCount + 1 logs for full cycles
     warning = `Predictions are based on ${sortedLogs.length} logged period(s). More data will improve accuracy.`;
  }
  if (sortedLogs.length === 1) {
    warning = `Predictions are based on a default ${DEFAULT_CYCLE_LENGTH}-day cycle. Log more periods for personalized predictions.`;
  }


  return {
    averageCycleLength,
    averagePeriodLength,
    nextPeriodStartDate: formatISODate(nextPeriodStartDate),
    ovulationDate: formatISODate(ovulationDate),
    fertileWindow: {
      start: formatISODate(fertileWindowStart),
      end: formatISODate(fertileWindowEnd),
    },
    warning
  };
};
