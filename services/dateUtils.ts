
// Parses YYYY-MM-DD string to Date object (UTC to avoid timezone issues)
export const parseISODate = (isoDateString: string): Date => {
  const [year, month, day] = isoDateString.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day));
};

// Formats Date object to YYYY-MM-DD string
export const formatISODate = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

// Adds days to a Date object
export const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setUTCDate(result.getUTCDate() + days);
  return result;
};

// Calculates difference in days between two dates
export const differenceInDays = (dateLeft: Date, dateRight: Date): number => {
  const MS_PER_DAY = 1000 * 60 * 60 * 24;
  const utc1 = Date.UTC(dateLeft.getUTCFullYear(), dateLeft.getUTCMonth(), dateLeft.getUTCDate());
  const utc2 = Date.UTC(dateRight.getUTCFullYear(), dateRight.getUTCMonth(), dateRight.getUTCDate());
  return Math.floor((utc2 - utc1) / MS_PER_DAY);
};

export const getDaysInMonth = (year: number, month: number): number => {
  return new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
};

export const getMonthName = (monthIndex: number): string => {
  const monthNames = ["January", "February", "March", "April", "May", "June",
                      "July", "August", "September", "October", "November", "December"];
  return monthNames[monthIndex];
};

export const isSameDay = (date1: Date, date2: Date): boolean => {
  return date1.getUTCFullYear() === date2.getUTCFullYear() &&
         date1.getUTCMonth() === date2.getUTCMonth() &&
         date1.getUTCDate() === date2.getUTCDate();
};
