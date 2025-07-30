import React, { useState, useEffect } from 'react';
import AuthScreen from './components/AuthScreen';
import Landing from './components/Landing';
import ProfileSetup from './components/ProfileSetup';
import MatchProfile from './components/MatchProfile';
import TasteExplorer from './components/TasteExplorer';
import VibeCheck from './components/VibeCheck';
import DateIdeas from './components/DateIdeas';
import ChatScreen from './components/ChatScreen';
import Navigation from './components/Navigation';
import { mockUsers } from './utils/mockData';
import { profileAPI } from './api';
import type { User } from './types';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [currentScreen, setCurrentScreen] = useState<string>('landing');
  const [currentUserIndex, setCurrentUserIndex] = useState(0);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [selectedChatUser, setSelectedChatUser] = useState<User | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState<boolean>(false);

  // Check authentication and load profile on app start
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      setIsAuthenticated(true);
      loadUserProfile();
    } else {
      // No token, make sure we're on landing
      setCurrentScreen('landing');
    }
  }, []);

  // Load user profile from API
  const loadUserProfile = async () => {
    setIsLoadingProfile(true);
    try {
      const response = await profileAPI.getProfile();
      console.log('Profile API response:', response); // Debug log
      
      if (response.profile) {
        // Convert API profile to User format
        const user: User = {
          id: response.profile.id,
          name: response.profile.name,
          age: response.profile.age,
          photos: response.profile.photos,
          bio: response.profile.bio,
          interests: response.profile.interests,
          personality: response.profile.personality,
          tastePreferences: response.profile.tastePreferences
        };
        setCurrentUser(user);
        console.log('Profile loaded successfully, setting user:', user); // Debug log
        
        // If user has a profile, route them to matching 
        // Don't override if they're specifically editing their profile
        if (currentScreen === 'landing' || currentScreen === 'auth') {
          console.log('Routing to matching screen'); // Debug log
          setCurrentScreen('matching');
        } else if (currentScreen === 'profileSetup') {
          // User has a profile but is on profile setup - this is edit mode
          console.log('User on profile setup with existing profile - edit mode'); // Debug log
        }
      } else {
        console.log('No profile data in response'); // Debug log
        // No profile exists, user needs to complete setup
        setCurrentUser(null);
        if (currentScreen !== 'profileSetup') {
          setCurrentScreen('profileSetup');
        }
      }
    } catch (error: any) {
      console.error('Failed to load profile:', error);
      // If profile doesn't exist (404), user needs to create one
      if (error.response?.status === 404) {
        console.log('Profile not found (404), routing to setup'); // Debug log
        setCurrentUser(null);
        if (isAuthenticated && currentScreen !== 'profileSetup') {
          setCurrentScreen('profileSetup');
        }
      } else {
        // Other errors might be network issues
        console.error('Error loading profile:', error);
        // Don't change the screen for other errors, let user try again
      }
    } finally {
      setIsLoadingProfile(false);
    }
  };

  const handleAuthSuccess = (token: string) => {
    setIsAuthenticated(true);
    localStorage.setItem('authToken', token);
    console.log('Auth successful, loading profile...'); // Debug log
    // Load the user's profile to check if they need to complete setup
    loadUserProfile();
  };

  const handleSignOut = () => {
    localStorage.removeItem('authToken');
    setIsAuthenticated(false);
    setCurrentScreen('landing');
    setCurrentUser(null);
  };

  const handleProfileComplete = (user: User) => {
    setCurrentUser(user);
    setCurrentScreen('matching');
  };

  // Show loading screen while checking profile
  if (isAuthenticated && isLoadingProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#2AAC7A] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  const renderScreen = () => {
    // Redirect unauthenticated users trying to access protected screens
    if (!isAuthenticated && ['profileSetup', 'matching', 'taste', 'vibe', 'dates', 'chat', 'profile'].includes(currentScreen)) {
      return <AuthScreen onAuthSuccess={handleAuthSuccess} />;
    }

    switch (currentScreen) {
      case 'landing':
        return <Landing onGetStarted={() => {
          if (isAuthenticated) {
            // If authenticated, check if they have a profile
            if (currentUser) {
              setCurrentScreen('matching');
            } else {
              setCurrentScreen('profileSetup');
            }
          } else {
            setCurrentScreen('auth');
          }
        }} />;

      case 'auth':
        return <AuthScreen onAuthSuccess={handleAuthSuccess} />;

      case 'profileSetup':
        console.log('Rendering ProfileSetup, currentUser:', currentUser); // Debug log
        return (
          <ProfileSetup
            onProfileComplete={handleProfileComplete}
            existingProfile={currentUser}
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
      {currentScreen !== 'landing' && currentScreen !== 'auth' && isAuthenticated && (
        <Navigation
          activeScreen={currentScreen}
          onScreenChange={setCurrentScreen}
        />
      )}
    </div>
  );
}

export default App;