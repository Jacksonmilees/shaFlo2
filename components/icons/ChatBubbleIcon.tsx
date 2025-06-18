
import React from 'react';

interface IconProps {
  className?: string;
}

export const ChatBubbleIcon: React.FC<IconProps> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className || "w-5 h-5"}>
    <path fillRule="evenodd" d="M10 2c-4.418 0-8 3.134-8 7s3.582 7 8 7c1.298 0 2.52-.271 3.625-.755V17.5a.5.5 0 00.824.38L16.5 15.606A7.95 7.95 0 0018 9c0-3.866-3.582-7-8-7zM8 8.5a1 1 0 100-2 1 1 0 000 2zm2.5-1a1 1 0 11-2 0 1 1 0 012 0zm2.5 1a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
  </svg>
);
