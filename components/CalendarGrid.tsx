import React, { useState, useMemo } from 'react';
import { PeriodLog, CyclePrediction, DayInfo, MoodLog } from '../types'; // Added MoodLog
import { parseISODate, formatISODate, addDays, getDaysInMonth, getMonthName, isSameDay } from '../services/dateUtils';
import { ChevronLeftIcon } from './icons/ChevronLeftIcon';
import { ChevronRightIcon } from './icons/ChevronRightIcon';

interface CalendarGridProps {
  periodLogs: PeriodLog[];
  prediction: CyclePrediction | null;
  moodLogs: MoodLog[]; // Added moodLogs
  getMoodLogForDate: (date: string) => MoodLog | undefined; // Function to get mood
}

const DayCell: React.FC<{ dayInfo: DayInfo }> = ({ dayInfo }) => {
  let cellClasses = "h-16 w-full flex flex-col items-center justify-center rounded-lg transition-all duration-200 ease-in-out text-sm relative aspect-square ";
  let dayNumberContainerClasses = "font-medium "; 

  if (!dayInfo.isCurrentMonth) {
    cellClasses += "text-gray-400 bg-gray-50";
    dayNumberContainerClasses += "opacity-70";
  } else {
    cellClasses += "bg-white hover:shadow-md ";
    if (dayInfo.isPeriodDay) {
      cellClasses += "bg-red-200 ";
      dayNumberContainerClasses += "font-semibold text-red-700";
    } else if (dayInfo.isOvulationDay) {
      cellClasses += "bg-purple-200 ";
      dayNumberContainerClasses += "font-semibold text-purple-700";
    } else if (dayInfo.isFertileDay) {
      cellClasses += "bg-green-200 ";
      dayNumberContainerClasses += "font-semibold text-green-700";
    } else {
      dayNumberContainerClasses += "text-bloom-text-dark";
    }
  }

  if (dayInfo.isToday) {
    cellClasses += " ring-2 ring-bloom-accent "; 
    dayNumberContainerClasses = `bg-bloom-accent text-white rounded-full w-7 h-7 flex items-center justify-center font-bold text-sm ${!dayInfo.isCurrentMonth ? 'opacity-90' : ''}`;
  }

  return (
    <div className={cellClasses}>
      <span className={dayNumberContainerClasses}>{dayInfo.date.getUTCDate()}</span>
      
      {/* Mood Emoji Display */}
      {dayInfo.isCurrentMonth && dayInfo.moodEmoji && (
          <span className="mt-0.5 text-lg" role="img" aria-label={`Mood: ${dayInfo.moodEmoji}`}>{dayInfo.moodEmoji}</span>
      )}

      {/* Cycle event dots */}
      {dayInfo.isCurrentMonth && (
        <div className={`flex space-x-1 ${dayInfo.moodEmoji ? 'mt-0' : 'mt-1'} absolute bottom-1.5 left-1/2 -translate-x-1/2`}>
          {dayInfo.isPeriodDay && <div className="w-1.5 h-1.5 bg-red-600 rounded-full" title="Period"></div>}
          {dayInfo.isOvulationDay && <div className="w-1.5 h-1.5 bg-purple-600 rounded-full" title="Ovulation"></div>}
          {dayInfo.isFertileDay && !dayInfo.isOvulationDay && <div className="w-1.5 h-1.5 bg-green-600 rounded-full" title="Fertile"></div>}
        </div>
      )}
    </div>
  );
};


export const CalendarGrid: React.FC<CalendarGridProps> = ({ periodLogs, prediction, moodLogs, getMoodLogForDate }) => {
  const [currentDate, setCurrentDate] = useState(new Date()); 
  const today = useMemo(() => new Date(), []); 

  const daysOfMonth = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth(); 

    const firstDayOfMonth = new Date(Date.UTC(year, month, 1));
    const lastDayOfMonth = new Date(Date.UTC(year, month, getDaysInMonth(year, month)));
    
    const days: DayInfo[] = [];
    
    const startDayOfWeek = firstDayOfMonth.getUTCDay(); 
    for (let i = 0; i < startDayOfWeek; i++) {
      const date = addDays(firstDayOfMonth, -(startDayOfWeek - i));
      const isTodayForCell = isSameDay(date, parseISODate(formatISODate(today)));
      const moodLog = getMoodLogForDate(formatISODate(date));
      days.push({ 
        date, 
        isCurrentMonth: false, 
        isToday: isTodayForCell, 
        isPeriodDay: false, 
        isFertileDay: false, 
        isOvulationDay: false,
        moodEmoji: moodLog?.mood 
      });
    }

    for (let i = 1; i <= lastDayOfMonth.getUTCDate(); i++) {
      const date = new Date(Date.UTC(year, month, i));
      let isPeriod = false;
      let isFertile = false;
      let isOvulation = false;

      for (const log of periodLogs) {
        const logStart = parseISODate(log.startDate);
        const logEnd = parseISODate(log.endDate);
        if (date >= logStart && date <= logEnd) {
          isPeriod = true;
          break;
        }
      }

      if (!isPeriod && prediction) {
        if (prediction.ovulationDate && isSameDay(date, parseISODate(prediction.ovulationDate))) {
          isOvulation = true;
          isFertile = true; 
        } else if (prediction.fertileWindow) {
          const fertileStart = parseISODate(prediction.fertileWindow.start);
          const fertileEnd = parseISODate(prediction.fertileWindow.end);
          if (date >= fertileStart && date <= fertileEnd) {
            isFertile = true;
          }
        }
      }
      
      const isTodayForCell = isSameDay(date, parseISODate(formatISODate(today)));
      const moodLog = getMoodLogForDate(formatISODate(date));

      days.push({ 
        date, 
        isCurrentMonth: true, 
        isToday: isTodayForCell, 
        isPeriodDay: isPeriod, 
        isFertileDay: isFertile, 
        isOvulationDay: isOvulation,
        moodEmoji: moodLog?.mood
      });
    }

    const lastDayOfWeek = lastDayOfMonth.getUTCDay();
    const daysToAddForNextMonth = (6 - lastDayOfWeek + 7) % 7; 
    for (let i = 1; i <= daysToAddForNextMonth; i++) {
      const date = addDays(lastDayOfMonth, i);
      const isTodayForCell = isSameDay(date, parseISODate(formatISODate(today)));
      const moodLog = getMoodLogForDate(formatISODate(date));
       days.push({ 
         date, 
         isCurrentMonth: false, 
         isToday: isTodayForCell, 
         isPeriodDay: false, 
         isFertileDay: false, 
         isOvulationDay: false,
         moodEmoji: moodLog?.mood
        });
    }
    
    const totalDaysToShow = 6 * 7;
    if (days.length < totalDaysToShow) {
        const lastDateInArray = days[days.length - 1].date;
        for (let i = 1; days.length < totalDaysToShow; i++) {
            const date = addDays(lastDateInArray, i);
            const isTodayForCell = isSameDay(date, parseISODate(formatISODate(today)));
            const moodLog = getMoodLogForDate(formatISODate(date));
            days.push({ 
              date, 
              isCurrentMonth: false, 
              isToday: isTodayForCell, 
              isPeriodDay: false, 
              isFertileDay: false, 
              isOvulationDay: false,
              moodEmoji: moodLog?.mood
            });
        }
    }
    return days;
  }, [currentDate, periodLogs, prediction, today, moodLogs, getMoodLogForDate]);

  const handlePrevMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };
  
  const handleGoToToday = () => {
    setCurrentDate(new Date());
  };

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <button onClick={handlePrevMonth} className="p-2 rounded-full hover:bg-bloom-secondary/30 text-bloom-primary transition-colors" aria-label="Previous month">
          <ChevronLeftIcon className="w-6 h-6" />
        </button>
        <div className="text-center">
            <h2 className="text-xl font-semibold text-bloom-text-dark">
              {getMonthName(currentDate.getMonth())} {currentDate.getFullYear()}
            </h2>
            <button 
              onClick={handleGoToToday} 
              className="text-xs text-bloom-primary hover:underline"
              aria-label="Go to today's month"
            >
              Today
            </button>
        </div>
        <button onClick={handleNextMonth} className="p-2 rounded-full hover:bg-bloom-secondary/30 text-bloom-primary transition-colors" aria-label="Next month">
          <ChevronRightIcon className="w-6 h-6" />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-sm text-bloom-text-light mb-2">
        {weekDays.map(day => <div key={day} className="font-medium">{day}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {daysOfMonth.map((dayInfo, index) => (
          <DayCell key={index} dayInfo={dayInfo} />
        ))}
      </div>
       <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-xs">
        <div className="flex items-center"><span className="w-3 h-3 bg-bloom-period/80 rounded-full mr-1.5"></span>Period</div>
        <div className="flex items-center"><span className="w-3 h-3 bg-bloom-fertile/70 rounded-full mr-1.5"></span>Fertile Window</div>
        <div className="flex items-center"><span className="w-3 h-3 bg-bloom-ovulation/80 rounded-full mr-1.5"></span>Predicted Ovulation</div>
        <div className="flex items-center"><span className="w-3 h-3 bg-bloom-accent rounded-full mr-1.5"></span>Today</div>
        <div className="flex items-center"><span className="text-base mr-1.5" role="img" aria-label="Logged mood icon">📝</span>Logged Mood</div>
      </div>
    </div>
  );
};