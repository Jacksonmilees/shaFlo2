import React, { useState, useEffect } from 'react';
import { useCycleTracker } from './hooks/useCycleTracker';
import { Header } from './components/Header';
import { CycleForm } from './components/CycleForm';
import { CycleInsights } from './components/CycleInsights';
import { CalendarGrid } from './components/CalendarGrid';
import { LoadingSpinner } from './components/LoadingSpinner';
import { WellnessAssistant } from './components/WellnessAssistant';
import { MoodLogger } from './components/MoodLogger'; // Import MoodLogger
import { CalendarIcon } from './components/icons/CalendarIcon';
import { ChatBubbleIcon } from './components/icons/ChatBubbleIcon';
import { HeartIcon } from './components/icons/HeartIcon'; // Import HeartIcon
import { formatISODate } from './services/dateUtils'; // For today's date

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}


const App: React.FC = () => {
  const { 
    periodLogs, 
    cyclePrediction, 
    addPeriodLog, 
    deletePeriodLog, 
    moodLogs, // Get mood data
    addMoodLog, 
    getMoodLogForDate,
    isLoading 
  } = useCycleTracker();
  
  const [installPromptEvent, setInstallPromptEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallButton, setShowInstallButton] = useState<boolean>(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault(); 
      setInstallPromptEvent(event as BeforeInstallPromptEvent);
      setShowInstallButton(true);
      console.log('ShaFlo: beforeinstallprompt event fired, Sharlene can install ShaFlo!');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    const handleAppInstalled = () => {
      console.log('ShaFlo PWA installed by Sharlene!');
      setShowInstallButton(false);
      setInstallPromptEvent(null);
    };
    window.addEventListener('appinstalled', handleAppInstalled);

    if (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone) {
        console.log("ShaFlo is running in standalone PWA mode.");
        setShowInstallButton(false); 
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!installPromptEvent) return;
    try {
      await installPromptEvent.prompt();
      const { outcome } = await installPromptEvent.userChoice;
      console.log(`ShaFlo: User response to the install prompt: ${outcome}`);
      if (outcome === 'accepted') {
        console.log('Sharlene accepted the ShaFlo install prompt!');
      } else {
        console.log('Sharlene dismissed the ShaFlo install prompt.');
      }
    } catch (error) {
        console.error('ShaFlo: Error during PWA install prompt:', error);
    } finally {
        setShowInstallButton(false);
        setInstallPromptEvent(null);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow container mx-auto p-4 flex justify-center items-center">
          <LoadingSpinner />
        </main>
      </div>
    );
  }

  const todayISO = formatISODate(new Date()); // Get today's date for MoodLogger

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-bloom-bg via-pink-50 to-purple-50">
      <Header />
      <main className="flex-grow container mx-auto p-4 md:p-6 lg:p-8 space-y-6 md:space-y-8">
        
        <div className="text-center my-4">
          <p className="text-2xl text-bloom-text-dark">
            Hello <span className="font-cursive text-bloom-primary text-3xl">Sharlene</span>!
          </p>
          <p className="text-md text-bloom-text-light">
            Here's a look at your cycle and wellness.
          </p>
        </div>

        {showInstallButton && (
          <div className="text-center my-4 p-4 bg-bloom-secondary/30 rounded-lg shadow">
            <p className="mb-3 text-bloom-text-dark">Want to use ShaFlo like an app, my love?</p>
            <button
              onClick={handleInstallClick}
              className="bg-bloom-accent text-white font-semibold py-3 px-8 rounded-lg shadow-md hover:bg-violet-600 transition-colors focus:outline-none focus:ring-2 focus:ring-violet-400 focus:ring-offset-2"
              aria-label="Install ShaFlo App"
            >
              Install ShaFlo App
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          <div className="lg:col-span-1 space-y-6 md:space-y-8">
            <SectionWrapper icon={<HeartIcon className="w-6 h-6 text-pink-500"/>} title="Daily Mood Check-in">
              <MoodLogger
                todayMoodLog={getMoodLogForDate(todayISO)}
                addMoodLog={addMoodLog}
                currentDate={todayISO}
              />
            </SectionWrapper>

            <SectionWrapper icon={<CalendarIcon className="w-6 h-6 text-bloom-primary"/>} title="Track Your Cycle">
              <CycleForm addPeriodLog={addPeriodLog} periodLogs={periodLogs} deletePeriodLog={deletePeriodLog} />
            </SectionWrapper>
            
            <SectionWrapper icon={<ChatBubbleIcon className="w-6 h-6 text-bloom-accent"/>} title="Cycle Summary">
              <CycleInsights prediction={cyclePrediction} />
            </SectionWrapper>
          </div>

          <div className="lg:col-span-2">
            <SectionWrapper icon={<CalendarIcon className="w-6 h-6 text-bloom-primary"/>} title="Monthly Overview">
              <CalendarGrid 
                periodLogs={periodLogs} 
                prediction={cyclePrediction} 
                moodLogs={moodLogs}
                getMoodLogForDate={getMoodLogForDate}
              />
            </SectionWrapper>
          </div>
        </div>
      </main>
      <WellnessAssistant periodLogs={periodLogs} cyclePrediction={cyclePrediction} />
      <footer className="text-center py-6 text-sm text-bloom-text-light">
        <p>&copy; {new Date().getFullYear()} ShaFlo. Made with love for Sharlene from Jackson.</p>
      </footer>
    </div>
  );
};

interface SectionWrapperProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}

const SectionWrapper: React.FC<SectionWrapperProps> = ({ title, icon, children }) => (
  <section className="bg-white/50 backdrop-blur-md p-0.5 rounded-2xl shadow-xl hover:shadow-2xl transition-shadow duration-300">
    <div className="bg-white/80 rounded-xl p-1">
        <div className="p-4 sm:p-6">
            <div className="flex items-center mb-4">
              <span className="mr-3 p-2 bg-bloom-secondary/20 rounded-full">{icon}</span>
              <h2 className="text-2xl font-semibold text-bloom-text-dark">{title}</h2>
            </div>
            {children}
        </div>
    </div>
  </section>
);

export default App;