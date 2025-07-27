import React from 'react';
import { Heart, Compass, Music, Zap, User } from 'lucide-react';

interface NavigationProps {
  activeScreen: string;
  onScreenChange: (screen: string) => void;
}

const Navigation: React.FC<NavigationProps> = ({ activeScreen, onScreenChange }) => {
  const navItems = [
    { id: 'matching', icon: Heart, label: 'Match' },
    { id: 'taste', icon: Compass, label: 'Taste' },
    { id: 'vibe', icon: Music, label: 'Vibe' },
    { id: 'dates', icon: Zap, label: 'Dates' },
    { id: 'profile', icon: User, label: 'Profile' }
  ];

  return (
    <div className="fixed top-0 left-0 right-0 bg-white/90 backdrop-blur-lg border-t border-gray-200 shadow-lg z-50">
      <div className="flex justify-around items-center py-1 px-4 max-w-md mx-auto">
        {navItems.map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            onClick={() => onScreenChange(id)}
            className={`flex flex-col items-center py-1 px-2 rounded-lg transition-all duration-200 ${
              activeScreen === id
                ? 'text-[#2AAC7A] bg-[#2AAC7A]/10'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Icon size={18} className="mb-1" />
            <span className="text-xs font-medium">{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default Navigation;