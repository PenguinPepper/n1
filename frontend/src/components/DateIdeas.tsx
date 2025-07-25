import React, { useState } from 'react';
import { Sparkles, Clock, DollarSign, Heart, RefreshCw, MapPin } from 'lucide-react';
import { mockDateIdeas } from '../utils/mockData';
import type { DateIdea } from '../types';

const DateIdeas: React.FC = () => {
  const [ideas, setIdeas] = useState<DateIdea[]>(mockDateIdeas);
  const [isGenerating, setIsGenerating] = useState(false);

  const generateNewIdeas = () => {
    setIsGenerating(true);
    
    // Simulate AI generation
    setTimeout(() => {
      const newIdeas: DateIdea[] = [
        {
          id: '4',
          title: 'Rooftop Stargazing',
          description: 'Watch the city lights while identifying constellations together',
          category: 'Romantic & Outdoor',
          duration: '2-3 hours',
          cost: 'Free',
          vibeMatch: 91
        },
        {
          id: '5',
          title: 'Cooking Class Adventure',
          description: 'Learn to make pasta from scratch with a local chef',
          category: 'Food & Learning',
          duration: '3 hours',
          cost: '$$$',
          vibeMatch: 87
        },
        {
          id: '6',
          title: 'Thrift Store Challenge',
          description: 'Find the best vintage outfit for each other under $20',
          category: 'Fun & Shopping',
          duration: '1-2 hours',
          cost: '$',
          vibeMatch: 84
        }
      ];
      setIdeas(newIdeas);
      setIsGenerating(false);
    }, 2000);
  };

  const getCostColor = (cost: string) => {
    switch (cost) {
      case 'Free': return 'text-green-600 bg-green-100';
      case '$': return 'text-blue-600 bg-blue-100';
      case '$$': return 'text-yellow-600 bg-yellow-100';
      case '$$$': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const DateIdeaCard: React.FC<{ idea: DateIdea }> = ({ idea }) => (
    <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="font-bold text-gray-800 text-lg mb-2">{idea.title}</h3>
          <p className="text-gray-600 text-sm leading-relaxed">{idea.description}</p>
        </div>
        <div className="flex items-center space-x-1 ml-4">
          <Heart size={14} className="text-[#FF6B6B]" />
          <span className="text-sm font-semibold text-[#2AAC7A]">{idea.vibeMatch}%</span>
        </div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <span className="px-3 py-1 bg-[#2AAC7A]/10 text-[#2AAC7A] rounded-full text-sm font-medium">
          {idea.category}
        </span>
        <div className="flex items-center space-x-4 text-sm text-gray-500">
          <div className="flex items-center space-x-1">
            <Clock size={14} />
            <span>{idea.duration}</span>
          </div>
          <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getCostColor(idea.cost)}`}>
            <DollarSign size={12} />
            <span>{idea.cost}</span>
          </div>
        </div>
      </div>

      <div className="flex space-x-3">
        <button className="flex-1 py-2 bg-gradient-to-r from-[#2AAC7A] to-[#6C5CE7] text-white rounded-xl font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-300 flex items-center justify-center space-x-2">
          <MapPin size={16} />
          <span>Plan This Date</span>
        </button>
        <button className="p-2 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
          <Heart size={20} className="text-gray-400 hover:text-[#FF6B6B]" />
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-pink-50 p-6 pb-24">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-[#FF6B6B] to-[#2AAC7A] rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Sparkles size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Date Concierge</h1>
          <p className="text-gray-600">AI-powered date ideas tailored for you</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-lg mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800">Your Personalized Ideas</h2>
            <button
              onClick={generateNewIdeas}
              disabled={isGenerating}
              className="p-2 bg-[#2AAC7A]/10 text-[#2AAC7A] rounded-xl hover:bg-[#2AAC7A]/20 transition-colors disabled:opacity-50"
            >
              <RefreshCw size={20} className={isGenerating ? 'animate-spin' : ''} />
            </button>
          </div>
          
          <div className="bg-gradient-to-r from-[#2AAC7A]/10 to-[#6C5CE7]/10 rounded-xl p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-[#2AAC7A] to-[#6C5CE7] rounded-full flex items-center justify-center">
                <Sparkles size={20} className="text-white" />
              </div>
              <div>
                <p className="font-semibold text-gray-800">Based on your matches</p>
                <p className="text-sm text-gray-600">
                  {isGenerating ? 'Generating fresh ideas...' : 'Ideas curated for Emma & you'}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {ideas.map((idea) => (
            <DateIdeaCard key={idea.id} idea={idea} />
          ))}
        </div>

        {isGenerating && (
          <div className="bg-white rounded-2xl p-8 shadow-lg mt-6">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-[#2AAC7A] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-gray-600">AI is crafting perfect date ideas...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DateIdeas;