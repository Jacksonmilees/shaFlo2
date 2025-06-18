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
  const [messageCount, setMessageCount] = useState<number>(0);
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
          text: "Hello! I'm AJ, your wellness assistant. I'm here to chat about health, wellness, and lifestyle topics. Feel free to ask me anything!",
          timestamp: Date.now()
        }]);
      }
    }
  }, [isOpen, periodLogs, cyclePrediction, messages.length]);

  const handleJacksonConnection = useCallback(() => {
    const jacksonMessage: WellnessMessage = {
      id: Date.now().toString(),
      sender: 'gemini',
      text: "Would you like to connect with a wellness expert? I can help you get in touch with a professional at +254700088271. Just let me know! 💕",
      timestamp: Date.now()
    };
    setMessages(prev => [...prev, jacksonMessage]);
  }, []);

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
    setMessageCount(prev => prev + 1);

    // Check if it's time to suggest connecting with Jackson
    if (messageCount === 3) {
      handleJacksonConnection();
      setIsLoading(false);
      return;
    }

    const enhancedPrompt = `Respond to this question in a helpful and engaging way:
    - Be informative and supportive
    - Share relevant insights and tips
    - Keep responses under 150 words
    - Feel free to be creative and engaging
    Question: ${userInput}`;

    try {
      const geminiResponseText = await getWellnessTip(enhancedPrompt);
      const geminiMessage: WellnessMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'gemini',
        text: geminiResponseText,
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, geminiMessage]);
    } catch (error) {
      const fallbackMessage: WellnessMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'gemini',
        text: "I'd love to help you with that! Could you try asking your question again? I'm here to chat about anything on your mind.",
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, fallbackMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [userInput, isLoading, currentPhase, messageCount, handleJacksonConnection]);

  if (!GEMINI_API_KEY_AVAILABLE) {
    return (
      <div className="fixed bottom-4 right-4 z-40">
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
          className="bg-bloom-accent hover:bg-violet-500 text-white p-4 rounded-full shadow-xl transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-bloom-accent focus:ring-offset-2 transform hover:rotate-3"
        >
          <ChatBubbleIcon className="w-7 h-7" />
        </button>
      </div>

      {isOpen && (
        <div 
          id="wellness-chat-window"
          className="fixed bottom-20 right-4 w-full max-w-md h-[70vh] max-h-[500px] bg-white rounded-2xl shadow-2xl flex flex-col z-30 border border-bloom-accent/50 overflow-hidden transform transition-all duration-300 animate-slide-up"
          role="dialog"
          aria-modal="true"
          aria-labelledby="wellness-chat-header"
        >
          <header className="bg-gradient-to-r from-bloom-accent to-violet-500 text-white p-4 flex justify-between items-center">
            <h3 id="wellness-chat-header" className="font-semibold text-lg flex items-center">
              <ChatBubbleIcon className="w-5 h-5 mr-2" />
              AJ Assistant
            </h3>
            <button 
              onClick={() => setIsOpen(false)} 
              className="text-white hover:bg-white/10 rounded-full p-1 transition-colors duration-200" 
              aria-label="Close chat window"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </header>

          {currentPhase && (
            <div className="p-3 text-center text-sm text-bloom-text-light bg-gradient-to-r from-pink-50 to-purple-50 border-b border-bloom-secondary/30">
              <span className="font-medium text-bloom-accent">Current Phase:</span> {currentPhase}
            </div>
          )}
          
          <div className="flex-grow p-4 space-y-3 overflow-y-auto bg-gradient-to-b from-white to-pink-50/30">
            {messages.map(msg => (
              <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-3 rounded-2xl shadow-md ${
                  msg.sender === 'user' 
                    ? 'bg-gradient-to-r from-bloom-primary to-pink-500 text-white rounded-br-none' 
                    : 'bg-white text-bloom-text-dark rounded-bl-none border border-gray-100'
                }`}>
                  <p className="text-sm whitespace-pre-wrap break-words">{msg.text}</p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="max-w-[85%] p-3 rounded-2xl bg-white text-bloom-text-dark border border-gray-100">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-bloom-accent rounded-full animate-bounce delay-75"></div>
                    <div className="w-2 h-2 bg-bloom-accent rounded-full animate-bounce delay-150"></div>
                    <div className="w-2 h-2 bg-bloom-accent rounded-full animate-bounce delay-225"></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSubmit} className="p-4 border-t border-gray-100 bg-white">
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="Ask AJ about health, wellness, or lifestyle..."
                aria-label="Type your message for AJ Assistant"
                className="flex-grow p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-bloom-accent focus:border-bloom-accent outline-none transition-all duration-200 text-base shadow-sm"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading || !userInput.trim()}
                className="bg-gradient-to-r from-bloom-accent to-violet-500 text-white px-4 py-3 rounded-xl font-semibold hover:opacity-90 disabled:opacity-50 transition-all duration-200 whitespace-nowrap shadow-md hover:shadow-lg transform hover:scale-105 disabled:transform-none"
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