import React, { useState } from 'react';
import { Heart, X, Info, Star, TrendingUp, Music } from 'lucide-react';
import type { User, MatchInsight } from '../types';
import { generateMatchInsights } from '../utils/mockData';

interface MatchProfileProps {
  user: User;
  onNext: () => void;
}

const MatchProfile: React.FC<MatchProfileProps> = ({ user, onNext }) => {
  const [showInsights, setShowInsights] = useState(false);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const insights = generateMatchInsights(user);

  const handleSwipe = (action: 'like' | 'pass') => {
    if (action === 'like') {
      setTimeout(() => {
        setShowInsights(true);
      }, 500);
    } else {
      onNext();
    }
  };

  const PersonalityBar: React.FC<{ label: string; value: number }> = ({ label, value }) => (
    <div className="mb-3">
      <div className="flex justify-between items-center mb-1">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <span className="text-sm text-[#2AAC7A] font-semibold">{value}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-gradient-to-r from-[#2AAC7A] to-[#6C5CE7] h-2 rounded-full transition-all duration-500"
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );

  if (showInsights) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 p-6">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-r from-[#2AAC7A] to-[#FF6B6B] rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart size={40} className="text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">It's a Match!</h2>
            <p className="text-gray-600">Here's why you two clicked</p>
          </div>

          <div className="space-y-4 mb-8">
            {insights.map((insight, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-6 shadow-lg transform hover:scale-105 transition-all duration-300"
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-gray-800">{insight.category}</h3>
                  <div className="flex items-center space-x-1">
                    <Star size={16} className="text-yellow-500 fill-yellow-500" />
                    <span className="font-bold text-[#2AAC7A]">{insight.score}%</span>
                  </div>
                </div>
                <p className="text-gray-600 mb-3">{insight.description}</p>
                <div className="space-y-1">
                  {insight.details.map((detail, idx) => (
                    <div key={idx} className="flex items-center space-x-2">
                      <TrendingUp size={14} className="text-[#2AAC7A]" />
                      <span className="text-sm text-gray-700">{detail}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={onNext}
            className="w-full bg-gradient-to-r from-[#2AAC7A] to-[#6C5CE7] text-white py-4 rounded-2xl font-bold text-lg hover:shadow-lg transform hover:scale-105 transition-all duration-300"
          >
            Start Chatting
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="flex-1 p-4 max-w-md mx-auto w-full">
        <div className="relative bg-white rounded-3xl shadow-2xl overflow-hidden h-[600px] mb-6">
          <div className="relative h-2/3">
            <img
              src={user.photos[currentPhotoIndex]}
              alt={user.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-4 right-4">
              <button
                onClick={() => setShowInsights(!showInsights)}
                className="bg-white/20 backdrop-blur-sm rounded-full p-2 text-white hover:bg-white/30 transition-all"
              >
                <Info size={20} />
              </button>
            </div>
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-6">
              <h2 className="text-white text-2xl font-bold mb-1">
                {user.name}, {user.age}
              </h2>
              {user.currentVibe && (
                <div className="flex items-center space-x-2 text-white/90">
                  <Music size={16} />
                  <span className="text-sm">{user.currentVibe.content}</span>
                </div>
              )}
            </div>
          </div>

          <div className="p-6 h-1/3 overflow-y-auto">
            <p className="text-gray-700 mb-4">{user.bio}</p>
            
            <div className="flex flex-wrap gap-2 mb-4">
              {user.interests.map((interest, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-[#2AAC7A]/10 text-[#2AAC7A] rounded-full text-sm font-medium"
                >
                  {interest}
                </span>
              ))}
            </div>

            <div className="space-y-2">
              <h4 className="font-semibold text-gray-800 mb-3">Personality Match</h4>
              <PersonalityBar label="Openness" value={user.personality.openness} />
              <PersonalityBar label="Extraversion" value={user.personality.extraversion} />
              <PersonalityBar label="Agreeableness" value={user.personality.agreeableness} />
            </div>
          </div>
        </div>

        <div className="flex space-x-4 justify-center">
          <button
            onClick={() => handleSwipe('pass')}
            className="w-16 h-16 bg-white rounded-full shadow-xl flex items-center justify-center text-gray-500 hover:bg-red-50 hover:text-red-500 transform hover:scale-110 transition-all duration-300"
          >
            <X size={28} />
          </button>
          <button
            onClick={() => handleSwipe('like')}
            className="w-16 h-16 bg-gradient-to-r from-[#FF6B6B] to-[#2AAC7A] rounded-full shadow-xl flex items-center justify-center text-white hover:shadow-2xl transform hover:scale-110 transition-all duration-300"
          >
            <Heart size={28} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default MatchProfile;