import React, { useState, useEffect } from 'react';

interface SplashScreenProps {
  onComplete: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const [displayText, setDisplayText] = useState('');
  const [showSubtitle, setShowSubtitle] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);
  const fullText = 'ShaFlo';

  useEffect(() => {
    let currentIndex = 0;
    const interval = setInterval(() => {
      if (currentIndex <= fullText.length) {
        setDisplayText(fullText.slice(0, currentIndex));
        currentIndex++;
      } else {
        clearInterval(interval);
        setTimeout(() => {
          setShowSubtitle(true);
          setTimeout(() => {
            setFadeOut(true);
            setTimeout(onComplete, 500); // Wait for fade out animation
          }, 1500);
        }, 500);
      }
    }, 150);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <div className={`fixed inset-0 flex flex-col items-center justify-center bg-pink-400 transition-opacity duration-500 ${fadeOut ? 'opacity-0' : 'opacity-100'}`}>
      <div className="text-center transform transition-all duration-500 ease-in-out">
        <h1 className="text-6xl md:text-7xl font-cursive text-white mb-4 tracking-wider">
          {displayText}
          <span className={`inline-block w-1 h-12 bg-white ml-1 align-middle ${displayText.length === fullText.length ? 'animate-pulse' : ''}`}></span>
        </h1>
        <p className={`text-xl text-white font-bold transition-all duration-500 transform ${showSubtitle ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
          Your Personal Cycle Companion
        </p>
      </div>
    </div>
  );
}; 