
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { getWellnessTip } from '../services/geminiService';
import { WellnessMessage, PeriodLog, CyclePrediction } from '../types';
import { GEMINI_API_KEY_AVAILABLE } from '../constants';
import { ChatBubbleIcon } from './icons/ChatBubbleIcon';
import { getCyclePhaseText } from '../services/cyclePhaseService';

interface WellnessAssistantProps {
  periodLogs: PeriodLog[];
  cyclePrediction: CyclePrediction | null;
}

export const WellnessAssistant: React.FC<WellnessAssistantProps> = ({ periodLogs, cyclePrediction }) => {
  const [messages, setMessages] = useState<WellnessMessage[]>([]);
  const [userInput, setUserInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [currentPhase, setCurrentPhase] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);
  
  useEffect(() => {
    if (isOpen) {
      const phaseText = getCyclePhaseText(periodLogs, cyclePrediction, new Date());
      setCurrentPhase(phaseText);

      if (messages.length === 0 && GEMINI_API_KEY_AVAILABLE) {
        setMessages([{
          id: Date.now().toString(),
          sender: 'gemini',
          text: "Hi Sharlene! I'm AJ Assistant, your personal guide in ShaFlo. How can I help you feel your best today? You can ask for general wellness tips, or advice related to your current cycle phase!",
          timestamp: Date.now()
        }]);
      }
    }
  }, [isOpen, periodLogs, cyclePrediction, messages.length]);


  const handleSubmit = useCallback(async (e?: React.FormEvent<HTMLFormElement>) => {
    if (e) e.preventDefault();
    if (!userInput.trim() || isLoading || !GEMINI_API_KEY_AVAILABLE) return;

    const userMessage: WellnessMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: userInput,
      timestamp: Date.now()
    };
    setMessages(prev => [...prev, userMessage]);
    setUserInput('');
    setIsLoading(true);

    // Construct prompt with phase context if available
    let promptWithContext = userInput;
    // The system instruction now guides Gemini to use this context if the user's query relates to it.
    // No explicit injection into user prompt needed unless we want to force it.
    // The user can see their phase and ask related questions.

    const geminiResponseText = await getWellnessTip(promptWithContext);
    
    const geminiMessage: WellnessMessage = {
      id: (Date.now() + 1).toString(), // Ensure unique ID
      sender: 'gemini',
      text: geminiResponseText,
      timestamp: Date.now()
    };
    setMessages(prev => [...prev, geminiMessage]);
    setIsLoading(false);
  }, [userInput, isLoading, currentPhase]);

  if (!GEMINI_API_KEY_AVAILABLE) {
    return (
      <div className="fixed bottom-4 right-4">
        <button
          title="AJ Assistant (Disabled)"
          aria-label="AJ Assistant (Disabled)"
          className="bg-gray-400 text-white p-3 rounded-full shadow-lg flex items-center justify-center cursor-not-allowed"
          disabled
        >
          <ChatBubbleIcon className="w-6 h-6" />
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="fixed bottom-4 right-4 z-40">
        <button
          onClick={() => setIsOpen(!isOpen)}
          title="AJ Assistant"
          aria-label={isOpen ? "Close AJ Assistant" : "Open AJ Assistant"}
          aria-expanded={isOpen}
          aria-controls="wellness-chat-window"
          className="bg-bloom-accent hover:bg-violet-500 text-white p-4 rounded-full shadow-xl transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-bloom-accent focus:ring-offset-2"
        >
          <ChatBubbleIcon className="w-7 h-7" />
        </button>
      </div>

      {isOpen && (
        <div 
          id="wellness-chat-window"
          className="fixed bottom-20 right-4 w-full max-w-md h-[70vh] max-h-[500px] bg-white rounded-xl shadow-2xl flex flex-col z-30 border border-bloom-accent/50 overflow-hidden"
          role="dialog"
          aria-modal="true"
          aria-labelledby="wellness-chat-header"
        >
          <header className="bg-bloom-accent text-white p-4 flex justify-between items-center">
            <h3 id="wellness-chat-header" className="font-semibold text-lg">AJ Assistant</h3>
            <button onClick={() => setIsOpen(false)} className="text-white hover:opacity-75 text-2xl leading-none p-1" aria-label="Close chat window">&times;</button>
          </header>

          {currentPhase && (
            <div className="p-2 text-center text-sm text-bloom-text-light bg-bloom-bg border-b border-bloom-secondary/30">
              AJ's note for you, my love: <span className="font-medium text-bloom-accent">{currentPhase}</span>
            </div>
          )}
          
          <div className="flex-grow p-4 space-y-3 overflow-y-auto bg-bloom-bg/30">
            {messages.map(msg => (
              <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-3 rounded-xl shadow ${
                  msg.sender === 'user' 
                    ? 'bg-bloom-primary text-white rounded-br-none' 
                    : 'bg-gray-200 text-bloom-text-dark rounded-bl-none'
                }`}>
                  <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="max-w-[80%] p-3 rounded-lg bg-gray-200 text-bloom-text-dark">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse delay-75"></div>
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse delay-150"></div>
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse delay-225"></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200 bg-white">
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="Ask AJ for a wellness tip..."
                aria-label="Type your message for AJ Assistant"
                className="flex-grow p-3 border border-gray-300 rounded-lg focus:ring-1 focus:ring-bloom-accent focus:border-bloom-accent outline-none transition-shadow"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading || !userInput.trim()}
                className="bg-bloom-accent text-white p-3 rounded-lg font-semibold hover:bg-violet-500 disabled:bg-gray-300 transition-colors"
                aria-label="Send message to AJ Assistant"
              >
                Send
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
};
