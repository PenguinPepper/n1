import React, { useState } from 'react';
import Landing from './components/Landing';
import MatchProfile from './components/MatchProfile';
import TasteExplorer from './components/TasteExplorer';
import VibeCheck from './components/VibeCheck';
import DateIdeas from './components/DateIdeas';
import Navigation from './components/Navigation';
import { mockUsers } from './utils/mockData';

function App() {
  const [currentScreen, setCurrentScreen] = useState<string>('landing');
  const [currentUserIndex, setCurrentUserIndex] = useState(0);

  const renderScreen = () => {
    switch (currentScreen) {
      case 'landing':
        return <Landing onGetStarted={() => setCurrentScreen('matching')} />;
      case 'matching':
        return (
          <MatchProfile
            user={mockUsers[currentUserIndex]}
            onNext={() => {
              if (currentUserIndex < mockUsers.length - 1) {
                setCurrentUserIndex(currentUserIndex + 1);
              } else {
                setCurrentUserIndex(0);
              }
            }}
          />
        );
      case 'taste':
        return <TasteExplorer />;
      case 'vibe':
        return <VibeCheck />;
      case 'dates':
        return <DateIdeas />;
      case 'profile':
        return (
          <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-6 pb-24">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-[#2AAC7A] to-[#6C5CE7] rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl text-white font-bold">You</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Your Profile</h2>
              <p className="text-gray-600">Profile customization coming soon!</p>
            </div>
          </div>
        );
      default:
        return <Landing onGetStarted={() => setCurrentScreen('matching')} />;
    }
  };

  return (
    <div className="min-h-screen">
      {renderScreen()}
      {currentScreen !== 'landing' && (
        <Navigation
          activeScreen={currentScreen}
          onScreenChange={setCurrentScreen}
        />
      )}
    </div>
  );
}

export default App;