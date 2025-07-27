import React, { useState } from 'react';
import Landing from './components/Landing';
import ProfileSetup from './components/ProfileSetup';
import MatchProfile from './components/MatchProfile';
import TasteExplorer from './components/TasteExplorer';
import VibeCheck from './components/VibeCheck';
import DateIdeas from './components/DateIdeas';
import ChatScreen from './components/ChatScreen';
import Navigation from './components/Navigation';
import { mockUsers } from './utils/mockData';
import type { User } from './types';

function App() {
  const [currentScreen, setCurrentScreen] = useState<string>('landing');
  const [currentUserIndex, setCurrentUserIndex] = useState(0);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [selectedChatUser, setSelectedChatUser] = useState<User | null>(null);

  const renderScreen = () => {
    switch (currentScreen) {
      case 'landing':
        return <Landing onGetStarted={() => setCurrentScreen('profileSetup')} />;
      case 'profileSetup':
        return (
          <ProfileSetup
            onProfileComplete={(user: User) => {
              setCurrentUser(user);
              setCurrentScreen('matching');
            }}
          />
        );
      case 'matching':
        return (
          <MatchProfile
            user={mockUsers[currentUserIndex]}
            onPass={() => {
              if (currentUserIndex < mockUsers.length - 1) {
                setCurrentUserIndex(currentUserIndex + 1);
              } else {
                setCurrentUserIndex(0);
              }
            }}
            onStartChatting={(user: User) => {
              setSelectedChatUser(user);
              setCurrentScreen('chat');
            }}
          />
        );
      case 'taste':
        return <TasteExplorer />;
      case 'vibe':
        return <VibeCheck />;
      case 'dates':
        return <DateIdeas />;
      case 'chat':
        return selectedChatUser ? (
          <ChatScreen
            user={selectedChatUser}
            onBack={() => {
              setCurrentScreen('matching');
              setSelectedChatUser(null);
            }}
          />
        ) : (
          <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <p className="text-gray-500">No chat selected</p>
          </div>
        );
      case 'profile':
        return (
          <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-6 pb-24">
            <div className="text-center max-w-md mx-auto">
              <div className="w-20 h-20 bg-gradient-to-r from-[#2AAC7A] to-[#6C5CE7] rounded-full flex items-center justify-center mx-auto mb-4">
                {currentUser ? (
                  <img
                    src={currentUser.photos[0]}
                    alt={currentUser.name}
                    className="w-20 h-20 rounded-full object-cover"
                  />
                ) : (
                  <span className="text-2xl text-white font-bold">You</span>
                )}
              </div>
              {currentUser ? (
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">
                    {currentUser.name}, {currentUser.age}
                  </h2>
                  <p className="text-gray-600 mb-4">{currentUser.bio}</p>
                  <div className="flex flex-wrap gap-2 justify-center mb-4">
                    {currentUser.interests.map((interest, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-[#2AAC7A]/10 text-[#2AAC7A] rounded-full text-sm font-medium"
                      >
                        {interest}
                      </span>
                    ))}
                  </div>
                  <button
                    onClick={() => setCurrentScreen('profileSetup')}
                    className="px-6 py-2 bg-gradient-to-r from-[#2AAC7A] to-[#6C5CE7] text-white rounded-xl font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-300"
                  >
                    Edit Profile
                  </button>
                </div>
              ) : (
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">Your Profile</h2>
                  <p className="text-gray-600 mb-4">Complete your profile setup to get started!</p>
                  <button
                    onClick={() => setCurrentScreen('profileSetup')}
                    className="px-6 py-2 bg-gradient-to-r from-[#2AAC7A] to-[#6C5CE7] text-white rounded-xl font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-300"
                  >
                    Setup Profile
                  </button>
                </div>
              )}
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