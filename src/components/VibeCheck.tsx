import React, { useState } from 'react';
import { Music, Film, BookOpen, Tv, Search, Users, Heart } from 'lucide-react';
import { generateVibeMatches } from '../utils/mockData';
import type { VibeMatch } from '../types';

const VibeCheck: React.FC = () => {
  const [content, setContent] = useState('');
  const [contentType, setContentType] = useState<'song' | 'movie' | 'book' | 'show'>('song');
  const [matches, setMatches] = useState<VibeMatch[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const contentTypes = [
    { id: 'song' as const, icon: Music, label: 'Song', placeholder: 'I\'m listening to...' },
    { id: 'movie' as const, icon: Film, label: 'Movie', placeholder: 'I just watched...' },
    { id: 'book' as const, icon: BookOpen, label: 'Book', placeholder: 'I\'m reading...' },
    { id: 'show' as const, icon: Tv, label: 'Show', placeholder: 'I\'m binge-watching...' }
  ];

  const handleSearch = async () => {
    if (!content.trim()) return;
    
    setIsSearching(true);
    // Simulate API delay
    setTimeout(() => {
      setMatches(generateVibeMatches(content));
      setIsSearching(false);
    }, 1500);
  };

  const currentType = contentTypes.find(type => type.id === contentType)!;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-6 pb-24">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-[#2AAC7A] to-[#FF6B6B] rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Music size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Vibe Check</h1>
          <p className="text-gray-600">Find people sharing your current vibe</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-lg mb-8">
          <div className="flex space-x-2 mb-6 overflow-x-auto">
            {contentTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => setContentType(type.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-medium transition-all duration-300 whitespace-nowrap ${
                  contentType === type.id
                    ? 'bg-[#2AAC7A] text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <type.icon size={16} />
                <span>{type.label}</span>
              </button>
            ))}
          </div>

          <div className="space-y-4">
            <div className="relative">
              <currentType.icon size={20} className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={currentType.placeholder}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2AAC7A] focus:border-transparent"
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>

            <button
              onClick={handleSearch}
              disabled={isSearching || !content.trim()}
              className="w-full py-3 bg-gradient-to-r from-[#2AAC7A] to-[#6C5CE7] text-white rounded-xl font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {isSearching ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Finding your vibe tribe...</span>
                </>
              ) : (
                <>
                  <Search size={20} />
                  <span>Find Vibe Matches</span>
                </>
              )}
            </button>
          </div>
        </div>

        {matches.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center space-x-2 mb-4">
              <Users size={20} className="text-[#2AAC7A]" />
              <h2 className="text-xl font-bold text-gray-800">Vibe Matches</h2>
            </div>

            {matches.map((match, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
              >
                <div className="flex items-center space-x-4 mb-4">
                  <img
                    src={match.user.photos[0]}
                    alt={match.user.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-800">
                      {match.user.name}, {match.user.age}
                    </h3>
                    <div className="flex items-center space-x-2">
                      <Heart size={14} className="text-[#FF6B6B]" />
                      <span className="text-sm text-[#2AAC7A] font-semibold">
                        {match.similarity}% vibe match
                      </span>
                    </div>
                  </div>
                </div>

                <p className="text-gray-600 text-sm mb-3">{match.user.bio}</p>

                <div className="space-y-2">
                  <h4 className="font-semibold text-gray-800">Shared Vibes:</h4>
                  <div className="flex flex-wrap gap-2">
                    {match.sharedContent.map((shared, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-[#2AAC7A]/10 text-[#2AAC7A] rounded-full text-sm font-medium"
                      >
                        {shared}
                      </span>
                    ))}
                  </div>
                </div>

                <button className="w-full mt-4 py-2 bg-gradient-to-r from-[#FF6B6B] to-[#2AAC7A] text-white rounded-xl font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-300">
                  Connect
                </button>
              </div>
            ))}
          </div>
        )}

        {!matches.length && !isSearching && content && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🎵</div>
            <p className="text-gray-500">No matches found for this vibe yet</p>
            <p className="text-gray-400 text-sm mt-2">Try a different piece of content</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default VibeCheck;