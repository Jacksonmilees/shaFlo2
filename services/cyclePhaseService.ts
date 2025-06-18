
import { PeriodLog, CyclePrediction } from '../types';
import { parseISODate, isSameDay, formatISODate, addDays } from './dateUtils';

export const getCyclePhaseText = (
  periodLogs: PeriodLog[],
  prediction: CyclePrediction | null,
  currentDate: Date
): string => {
  const today = parseISODate(formatISODate(currentDate)); // Normalize to UTC day start for consistent comparison

  // 1. Check current menstruation from logs (sorted to ensure correct last period check later if needed)
  const sortedLogs = [...periodLogs].sort((a, b) => parseISODate(a.startDate).getTime() - parseISODate(b.startDate).getTime());
  for (const log of sortedLogs) {
    const startDate = parseISODate(log.startDate);
    const endDate = parseISODate(log.endDate);
    if (today >= startDate && today <= endDate) {
      return "Menstrual Phase";
    }
  }

  // If no detailed prediction, cannot determine phase accurately
  if (!prediction || !prediction.nextPeriodStartDate || !prediction.fertileWindow || !prediction.ovulationDate) {
    if (sortedLogs.length > 0 && sortedLogs.length < 2) {
         return "Log one more period for detailed phase insights.";
    }
    if (sortedLogs.length === 0) {
        return "Log your period to get started with phase insights.";
    }
    return "Awaiting more data for detailed phase.";
  }
  
  const ovulationDay = parseISODate(prediction.ovulationDate);
  const fertileStart = parseISODate(prediction.fertileWindow.start);
  const fertileEnd = parseISODate(prediction.fertileWindow.end);
  const nextPeriodDay = parseISODate(prediction.nextPeriodStartDate);

  // 2. Ovulation Day (most specific, falls within fertile window)
  if (isSameDay(today, ovulationDay)) {
    return "Ovulation Day";
  }

  // 3. Fertile Window
  if (today >= fertileStart && today <= fertileEnd) {
    return "Fertile Window";
  }

  // 4. Luteal Phase: After fertile window ends, before next period begins
  if (today > fertileEnd && today < nextPeriodDay) {
    return "Luteal Phase";
  }

  // 5. Follicular Phase: After last actual period ends (if available) or predicted last period ends,
  //    and before fertile window starts.
  let lastPeriodActualEndDate: Date | null = null;
  if (sortedLogs.length > 0) {
    lastPeriodActualEndDate = parseISODate(sortedLogs[sortedLogs.length - 1].endDate);
  }
  
  // Determine start point for follicular phase check
  // (Either end of last logged period, or estimated end of period before the 'nextPeriodDay')
  let follicularPhaseStartDateAfter: Date | null = null;

  if (lastPeriodActualEndDate) {
    follicularPhaseStartDateAfter = lastPeriodActualEndDate;
  } else if (prediction.averageCycleLength > 0 && prediction.averagePeriodLength > 0) {
    // Estimate end of the cycle's *previous* period if no logs exist
    const estimatedPrevPeriodStart = addDays(nextPeriodDay, -prediction.averageCycleLength);
    follicularPhaseStartDateAfter = addDays(estimatedPrevPeriodStart, prediction.averagePeriodLength - 1);
  }

  if (follicularPhaseStartDateAfter && today > follicularPhaseStartDateAfter && today < fertileStart) {
    return "Follicular Phase";
  }
  
  // If today is on or after the predicted next period start date, a new cycle might be starting.
  if (today >= nextPeriodDay) {
      return "A new cycle may have begun. Log your period for updated insights."
  }

  return "Cycle phase is being calculated..."; // General fallback
};
