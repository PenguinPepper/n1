import React, { useState } from 'react';
import { Search, Film, Music, BookOpen, Sparkles } from 'lucide-react';
import { generateTasteResults } from '../utils/mockData';
import type { TasteResult } from '../types';

const TasteExplorer: React.FC = () => {
  const [keyword, setKeyword] = useState('');
  const [results, setResults] = useState<TasteResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async () => {
    if (!keyword.trim()) return;
    
    setIsLoading(true);
    // Simulate API delay
    setTimeout(() => {
      setResults(generateTasteResults(keyword));
      setIsLoading(false);
    }, 1000);
  };

  const CategorySection: React.FC<{
    title: string;
    icon: React.ComponentType<any>;
    items: string[];
    color: string;
  }> = ({ title, icon: Icon, items, color }) => (
    <div className="bg-white rounded-2xl p-6 shadow-lg">
      <div className="flex items-center space-x-3 mb-4">
        <div className={`${color} rounded-lg p-2`}>
          <Icon size={20} className="text-white" />
        </div>
        <h3 className="font-bold text-gray-800">{title}</h3>
      </div>
      <div className="space-y-2">
        {items.map((item, index) => (
          <div
            key={index}
            className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <span className="text-gray-700">{item}</span>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-6 pb-24">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-[#6C5CE7] to-[#2AAC7A] rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Sparkles size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Taste Explorer</h1>
          <p className="text-gray-600">Discover culture through a single keyword</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-lg mb-8">
          <div className="flex space-x-3">
            <div className="flex-1 relative">
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="Enter a vibe... (e.g., Cyberpunk, Lo-fi, Vintage)"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2AAC7A] focus:border-transparent"
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <button
              onClick={handleSearch}
              disabled={isLoading || !keyword.trim()}
              className="px-6 py-3 bg-gradient-to-r from-[#2AAC7A] to-[#6C5CE7] text-white rounded-xl font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Search size={20} />
              )}
            </button>
          </div>
        </div>

        {results && (
          <div className="space-y-6">
            <CategorySection
              title="Movies"
              icon={Film}
              items={results.movies}
              color="bg-red-500"
            />
            <CategorySection
              title="Music"
              icon={Music}
              items={results.music}
              color="bg-[#2AAC7A]"
            />
            <CategorySection
              title="Books"
              icon={BookOpen}
              items={results.books}
              color="bg-blue-500"
            />
            <CategorySection
              title="Vibes"
              icon={Sparkles}
              items={results.vibes}
              color="bg-purple-500"
            />
          </div>
        )}

        {!results && !isLoading && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🎭</div>
            <p className="text-gray-500">Enter a keyword to explore cultural connections</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TasteExplorer;