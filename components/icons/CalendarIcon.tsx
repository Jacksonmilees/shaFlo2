
import React from 'react';

interface IconProps {
  className?: string;
}

export const CalendarIcon: React.FC<IconProps> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className || "w-5 h-5"}>
    <path fillRule="evenodd" d="M5.75 2a.75.75 0 01.75.75V4h7V2.75a.75.75 0 011.5 0V4h.25A2.75 2.75 0 0118 6.75v8.5A2.75 2.75 0 0115.25 18H4.75A2.75 2.75 0 012 15.25v-8.5A2.75 2.75 0 014.75 4H5V2.75A.75.75 0 015.75 2zM4.5 8.251c0-.29.206-.536.488-.616l.004-.001.012-.004.02-.006a1.006 1.006 0 01.376-.064h10.2c.133.003.264.02.389.053l.004.002.016.007.012.005a.6.6 0 00.19.083.626.626 0 00.312-.135A.626.626 0 0016 7.5v.001a.75.75 0 01-1.5 0V7.5h-11v.75a.75.75 0 01-1.5 0V7.5a.75.75 0 01.75-.75H4V8.25zM6 12a1 1 0 11-2 0 1 1 0 012 0zm3 1a1 1 0 100-2 1 1 0 000 2zm3-1a1 1 0 11-2 0 1 1 0 012 0zm3 1a1 1 0 100-2 1 1 0 000 2zM5 16a1 1 0 100-2 1 1 0 000 2zm3-1a1 1 0 11-2 0 1 1 0 012 0zm4 0a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
  </svg>
);
