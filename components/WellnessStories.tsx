import React, { useState, useEffect } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from './icons/ChevronIcon';
import { getWellnessTip } from '../services/geminiService';
import { GEMINI_API_KEY_AVAILABLE } from '../constants';

interface Story {
  id: string;
  title: string;
  content: string;
  source: string;
  category: string;
  imageUrl: string;
}

const CATEGORIES = [
  'wellness', 'cycle', 'lifestyle', 'science', 'nutrition', 'exercise',
  'mental health', 'sleep', 'stress', 'hormones', 'diet', 'fitness'
] as const;

const PROMPTS = {
  wellness: "Share a general fact about women's health and wellness. Keep it educational and neutral. Keep it under 100 words.",
  cycle: "Share a general fact about menstrual cycles. Keep it educational and neutral. Keep it under 100 words.",
  lifestyle: "Share a general health tip about lifestyle choices. Keep it educational and neutral. Keep it under 100 words.",
  science: "Share a scientific fact about women's health. Keep it educational and neutral. Keep it under 100 words.",
  nutrition: "Share a nutritional fact related to women's health. Keep it educational and neutral. Keep it under 100 words.",
  exercise: "Share a fact about exercise and women's health. Keep it educational and neutral. Keep it under 100 words.",
  'mental health': "Share a fact about mental health and wellness. Keep it educational and neutral. Keep it under 100 words.",
  sleep: "Share a fact about sleep and its impact on health. Keep it educational and neutral. Keep it under 100 words.",
  stress: "Share a fact about stress management and health. Keep it educational and neutral. Keep it under 100 words.",
  hormones: "Share a fact about hormonal health. Keep it educational and neutral. Keep it under 100 words.",
  diet: "Share a fact about diet and nutrition. Keep it educational and neutral. Keep it under 100 words.",
  fitness: "Share a fact about physical fitness and health. Keep it educational and neutral. Keep it under 100 words."
};

const getRandomImage = (category: string) => {
  const categoryTerms = {
    wellness: ['wellness', 'health', 'balance', 'mindfulness', 'meditation', 'selfcare'],
    cycle: ['menstrual', 'cycle', 'period', 'feminine', 'health', 'wellness'],
    lifestyle: ['healthy lifestyle', 'wellness', 'balance', 'daily routine', 'selfcare'],
    science: ['medical', 'science', 'research', 'laboratory', 'healthcare', 'technology'],
    nutrition: ['healthy food', 'nutrition', 'diet', 'fruits', 'vegetables', 'wellness'],
    exercise: ['fitness', 'workout', 'exercise', 'yoga', 'meditation', 'wellness'],
    'mental health': ['mental health', 'mindfulness', 'meditation', 'therapy', 'wellness'],
    sleep: ['sleep', 'rest', 'relaxation', 'bedroom', 'wellness', 'peace'],
    stress: ['stress relief', 'relaxation', 'calm', 'peace', 'mindfulness'],
    hormones: ['hormonal health', 'balance', 'wellness', 'medical', 'science'],
    diet: ['healthy diet', 'nutrition', 'food', 'wellness', 'balance'],
    fitness: ['fitness', 'exercise', 'workout', 'health', 'wellness']
  };

  const terms = categoryTerms[category as keyof typeof categoryTerms] || ['health', 'wellness'];
  const randomTerm = terms[Math.floor(Math.random() * terms.length)];
  
  // Add quality parameters and orientation
  return `https://source.unsplash.com/random/800x600/?${randomTerm}&orientation=landscape&quality=80`;
};

export const WellnessStories: React.FC = () => {
  const [stories, setStories] = useState<Story[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  const fetchStories = async () => {
    if (!GEMINI_API_KEY_AVAILABLE) return;

    try {
      setIsLoading(true);
      const newStories: Story[] = [];
      const shuffledCategories = [...CATEGORIES].sort(() => Math.random() - 0.5).slice(0, 6);
      
      for (const category of shuffledCategories) {
        const content = await getWellnessTip(PROMPTS[category]);
        const lines = content.split('\n');
        const title = lines[0].replace(/^["']|["']$/g, '');
        const storyContent = lines.slice(1).join('\n').trim();

        newStories.push({
          id: `${category}-${Date.now()}`,
          title,
          content: storyContent,
          source: 'Health Facts',
          category,
          imageUrl: getRandomImage(category)
        });
      }

      setStories(newStories);
    } catch (error) {
      console.error('Error fetching stories:', error);
      // Fallback to default stories if API fails
      setStories([
        {
          id: '1',
          title: 'Menstrual Cycle Basics',
          content: 'The average menstrual cycle is 28 days, with variations between 21 to 35 days considered normal. Cycle length can vary throughout life.',
          source: 'Health Facts',
          category: 'cycle',
          imageUrl: getRandomImage('cycle')
        },
        {
          id: '2',
          title: 'Physical Activity Benefits',
          content: 'Regular exercise can help reduce menstrual cramps and improve overall health. Activities like walking, yoga, and swimming are beneficial.',
          source: 'Health Facts',
          category: 'wellness',
          imageUrl: getRandomImage('wellness')
        },
        {
          id: '3',
          title: 'Nutritional Support',
          content: 'Dark chocolate, bananas, and leafy greens provide essential nutrients that support the body during the menstrual cycle.',
          source: 'Health Facts',
          category: 'lifestyle',
          imageUrl: getRandomImage('lifestyle')
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStories();
  }, [refreshKey]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isAutoPlaying && !isLoading) {
      interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % stories.length);
      }, 10000);
    }
    return () => clearInterval(interval);
  }, [isAutoPlaying, stories.length, isLoading]);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % stories.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + stories.length) % stories.length);
  };

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 flex items-center justify-center min-h-[300px]">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-bloom-primary rounded-full animate-bounce delay-75"></div>
          <div className="w-3 h-3 bg-bloom-primary rounded-full animate-bounce delay-150"></div>
          <div className="w-3 h-3 bg-bloom-primary rounded-full animate-bounce delay-225"></div>
        </div>
      </div>
    );
  }

  const currentStory = stories[currentIndex];

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="relative">
        {/* Story Image */}
        <div className="h-48 bg-gradient-to-r from-bloom-primary/20 to-bloom-accent/20 relative">
          <img
            src={currentStory.imageUrl}
            alt={currentStory.title}
            className="w-full h-full object-cover opacity-50"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = getRandomImage(currentStory.category);
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        </div>

        {/* Navigation Buttons */}
        <button
          onClick={prevSlide}
          className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full shadow-lg hover:bg-white transition-colors"
          aria-label="Previous story"
        >
          <ChevronLeftIcon className="w-6 h-6 text-bloom-primary" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full shadow-lg hover:bg-white transition-colors"
          aria-label="Next story"
        >
          <ChevronRightIcon className="w-6 h-6 text-bloom-primary" />
        </button>

        {/* Content */}
        <div className="p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-bloom-accent">
              {currentStory.category.toUpperCase()}
            </span>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleRefresh}
                className="text-sm text-bloom-text-light hover:text-bloom-primary transition-colors"
                aria-label="Refresh stories"
              >
                ↻
              </button>
              <button
                onClick={() => setIsAutoPlaying(!isAutoPlaying)}
                className="text-sm text-bloom-text-light hover:text-bloom-primary transition-colors"
              >
                {isAutoPlaying ? 'Pause' : 'Play'}
              </button>
            </div>
          </div>
          
          <h3 className="text-xl font-semibold text-bloom-text-dark mb-2">
            {currentStory.title}
          </h3>
          
          <p className="text-bloom-text-light mb-4">
            {currentStory.content}
          </p>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-bloom-text-light">
              Source: {currentStory.source}
            </span>
            <div className="flex space-x-1">
              {stories.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentIndex ? 'bg-bloom-primary' : 'bg-gray-300'
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 