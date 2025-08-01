import React, { useState, useEffect } from 'react';
import { User, Camera, Plus, X, ArrowRight } from 'lucide-react';
import { profileAPI } from '../api';
import type { User as UserType } from '../types/index';

interface ProfileSetupProps {
  onProfileComplete: (user: UserType) => void;
}

const ProfileSetup: React.FC<ProfileSetupProps> = ({ onProfileComplete }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeneratingBio, setIsGeneratingBio] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    bio: '',
    interests: '',
    photo: '',
    tastePreferences: {
      movies: '',
      music: '',
      books: '',
      tvShows: '',
      genres: '',
      artists: ''
    },
    personality: {
      openness: 50,
      conscientiousness: 50,
      extraversion: 50,
      agreeableness: 50,
      neuroticism: 50
    }
  });

  const totalSteps = 5;

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePersonalityChange = (trait: string, value: number) => {
    setFormData(prev => ({
      ...prev,
      personality: {
        ...prev.personality,
        [trait]: value
      }
    }));
  };

  const handleTasteChange = (category: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      tastePreferences: {
        ...prev.tastePreferences,
        [category]: value
      }
    }));
  };
  const handleInterestAdd = (interest: string) => {
    if (interest.trim() && !formData.interests.split(',').map(i => i.trim()).includes(interest.trim())) {
      const newInterests = formData.interests ? `${formData.interests}, ${interest.trim()}` : interest.trim();
      setFormData(prev => ({ ...prev, interests: newInterests }));
    }
  };

  const handleInterestRemove = (interestToRemove: string) => {
    const interests = formData.interests.split(',').map(i => i.trim()).filter(i => i !== interestToRemove);
    setFormData(prev => ({ ...prev, interests: interests.join(', ') }));
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return formData.name.trim() && formData.age && parseInt(formData.age) >= 18;
      case 2:
        return formData.bio.trim().length >= 20;
      case 3:
        return formData.interests.trim().length > 0;
      case 4:
        return formData.photo.trim().length > 0;
      case 5:
        const { movies, music, books } = formData.tastePreferences;
        return movies.trim().length > 0 || music.trim().length > 0 || books.trim().length > 0;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = () => {
    handleSubmitProfile();
  };

  const handleGenerateBio = async () => {
    setIsGeneratingBio(true);
    setError(null);

    try {
      // Prepare data for bio generation
      const bioData = {
        interests: formData.interests ? formData.interests.split(',').map(i => i.trim()).filter(i => i) : [],
        personality: formData.personality,
        tastePreferences: {
          movies: formData.tastePreferences.movies ? formData.tastePreferences.movies.split(',').map(item => item.trim()).filter(item => item) : [],
          music: formData.tastePreferences.music ? formData.tastePreferences.music.split(',').map(item => item.trim()).filter(item => item) : [],
          books: formData.tastePreferences.books ? formData.tastePreferences.books.split(',').map(item => item.trim()).filter(item => item) : [],
          tvShows: formData.tastePreferences.tvShows ? formData.tastePreferences.tvShows.split(',').map(item => item.trim()).filter(item => item) : [],
          genres: formData.tastePreferences.genres ? formData.tastePreferences.genres.split(',').map(item => item.trim()).filter(item => item) : [],
          artists: formData.tastePreferences.artists ? formData.tastePreferences.artists.split(',').map(item => item.trim()).filter(item => item) : []
        },
        currentBio: formData.bio
      };

      // Call the API to generate bio
      const response = await profileAPI.generateBio(bioData);
      
      if (response.bio) {
        // Update the bio in form data
        setFormData(prev => ({
          ...prev,
          bio: response.bio
        }));
      } else {
        throw new Error('No bio generated');
      }
    } catch (err: any) {
      console.error('Bio generation error:', err);
      
      // Handle different types of errors
      if (err.response?.data?.error) {
        setError(`Bio generation failed: ${err.response.data.error}`);
      } else if (err.message) {
        setError(`Bio generation failed: ${err.message}`);
      } else {
        setError('Failed to generate bio. Please try again.');
      }
    } finally {
      setIsGeneratingBio(false);
    }
  };
  const handleSubmitProfile = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      // Prepare the profile data for the API
      const profileData = {
        name: formData.name,
        age: parseInt(formData.age),
        bio: formData.bio,
        photos: formData.photo ? [formData.photo] : [],
        interests: formData.interests.split(',').map(i => i.trim()).filter(i => i),
        personality: formData.personality,
        tastePreferences: {
          movies: formData.tastePreferences.movies.split(',').map(item => item.trim()).filter(item => item),
          music: formData.tastePreferences.music.split(',').map(item => item.trim()).filter(item => item),
          books: formData.tastePreferences.books.split(',').map(item => item.trim()).filter(item => item),
          tvShows: formData.tastePreferences.tvShows.split(',').map(item => item.trim()).filter(item => item),
          genres: formData.tastePreferences.genres.split(',').map(item => item.trim()).filter(item => item),
          artists: formData.tastePreferences.artists.split(',').map(item => item.trim()).filter(item => item)
        }
      };

      // Call the API to create the profile
      const response = await profileAPI.createProfile(profileData);
      
      if (response.profile) {
        // Convert the API response to the User format expected by the frontend
        const user: UserType = {
          id: response.profile.id,
          name: response.profile.name,
          age: response.profile.age,
          photos: response.profile.photos,
          bio: response.profile.bio,
          interests: response.profile.interests,
          personality: response.profile.personality,
          tastePreferences: response.profile.tastePreferences,
          currentVibe: response.profile.currentVibe
        };
        
        onProfileComplete(user);
      } else {
        throw new Error('Profile creation failed - no profile data returned');
      }
    } catch (err: any) {
      console.error('Profile creation error:', err);
      
      // Handle different types of errors
      if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else if (err.response?.data?.errors) {
        // Handle validation errors
        const validationErrors = err.response.data.errors.map((e: any) => e.msg).join(', ');
        setError(`Validation errors: ${validationErrors}`);
      } else if (err.message) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCompleteOriginal = () => {
    const tastePreferences = {
      movies: formData.tastePreferences.movies.split(',').map(item => item.trim()).filter(item => item),
      music: formData.tastePreferences.music.split(',').map(item => item.trim()).filter(item => item),
      books: formData.tastePreferences.books.split(',').map(item => item.trim()).filter(item => item),
      tvShows: formData.tastePreferences.tvShows.split(',').map(item => item.trim()).filter(item => item),
      genres: formData.tastePreferences.genres.split(',').map(item => item.trim()).filter(item => item),
      artists: formData.tastePreferences.artists.split(',').map(item => item.trim()).filter(item => item)
    };

    const user: UserType = {
      id: 'current-user',
      name: formData.name,
      age: parseInt(formData.age),
      photos: [formData.photo],
      bio: formData.bio,
      interests: formData.interests.split(',').map(i => i.trim()).filter(i => i),
      personality: formData.personality,
      tastePreferences: tastePreferences
    };
    onProfileComplete(user);
  };

  const PersonalitySlider: React.FC<{ 
    label: string; 
    trait: string; 
    value: number; 
    description: string;
  }> = ({ label, trait, value, description }) => (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-2">
        <label className="font-semibold text-gray-800">{label}</label>
        <span className="text-[#2AAC7A] font-bold">{value}%</span>
      </div>
      <input
        type="range"
        min="0"
        max="100"
        value={value}
        onChange={(e) => handlePersonalityChange(trait, parseInt(e.target.value))}
        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
        style={{
          background: `linear-gradient(to right, #2AAC7A 0%, #2AAC7A ${value}%, #e5e7eb ${value}%, #e5e7eb 100%)`
        }}
      />
      <p className="text-sm text-gray-600 mt-1">{description}</p>
    </div>
  );

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-r from-[#2AAC7A] to-[#6C5CE7] rounded-2xl flex items-center justify-center mx-auto mb-4">
                <User size={32} className="text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Tell us about yourself</h2>
              <p className="text-gray-600">Let's start with the basics</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Your first name"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2AAC7A] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Age</label>
                <input
                  type="number"
                  value={formData.age}
                  onChange={(e) => handleInputChange('age', e.target.value)}
                  placeholder="Your age"
                  min="18"
                  max="100"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2AAC7A] focus:border-transparent"
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-r from-[#FF6B6B] to-[#2AAC7A] rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">✨</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Your story</h2>
              <p className="text-gray-600">Write a bio that shows your personality</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Bio ({formData.bio.length}/500)
              </label>
              <div className="flex space-x-2 mb-2">
                <button
                  type="button"
                  onClick={handleGenerateBio}
                  disabled={isGeneratingBio}
                  className="px-4 py-2 bg-gradient-to-r from-[#6C5CE7] to-[#2AAC7A] text-white rounded-lg font-medium hover:shadow-lg transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center space-x-2 text-sm"
                >
                  {isGeneratingBio ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Generating...</span>
                    </>
                  ) : (
                    <>
                      <span className="text-lg">✨</span>
                      <span>Generate Bio with AI</span>
                    </>
                  )}
                </button>
              </div>
              <textarea
                value={formData.bio}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                placeholder="Tell people what makes you unique. What are you passionate about? What's your vibe?"
                maxLength={500}
                rows={6}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2AAC7A] focus:border-transparent resize-none"
              />
              <p className="text-sm text-gray-500 mt-2">Minimum 20 characters</p>
              {isGeneratingBio && (
                <div className="mt-2 p-3 bg-[#6C5CE7]/10 rounded-lg">
                  <p className="text-sm text-[#6C5CE7] font-medium">
                    🤖 AI is crafting your perfect bio based on your interests and personality...
                  </p>
                </div>
              )}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-r from-[#6C5CE7] to-[#FF6B6B] rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🎯</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Your interests</h2>
              <p className="text-gray-600">What are you passionate about?</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Add interests</label>
              <div className="flex space-x-2 mb-4">
                <input
                  type="text"
                  placeholder="Type an interest and press Enter"
                  className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2AAC7A] focus:border-transparent"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleInterestAdd(e.currentTarget.value);
                      e.currentTarget.value = '';
                    }
                  }}
                />
              </div>

              <div className="grid grid-cols-2 gap-2 mb-4">
                {['Music', 'Art', 'Travel', 'Coffee', 'Books', 'Movies', 'Hiking', 'Photography'].map((interest) => (
                  <button
                    key={interest}
                    onClick={() => handleInterestAdd(interest)}
                    className="p-2 text-sm border border-gray-200 rounded-lg hover:bg-[#2AAC7A]/10 hover:border-[#2AAC7A] transition-colors"
                  >
                    + {interest}
                  </button>
                ))}
              </div>

              {formData.interests && (
                <div className="space-y-2">
                  <h4 className="font-semibold text-gray-700">Your interests:</h4>
                  <div className="flex flex-wrap gap-2">
                    {formData.interests.split(',').map(interest => interest.trim()).filter(i => i).map((interest, index) => (
                      <span
                        key={index}
                        className="flex items-center space-x-2 px-3 py-1 bg-[#2AAC7A]/10 text-[#2AAC7A] rounded-full text-sm font-medium"
                      >
                        <span>{interest}</span>
                        <button
                          onClick={() => handleInterestRemove(interest)}
                          className="hover:text-red-500"
                        >
                          <X size={14} />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-r from-[#2AAC7A] to-[#6C5CE7] rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Camera size={32} className="text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Add your photo</h2>
              <p className="text-gray-600">Show your best self</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Photo URL</label>
                <input
                  type="url"
                  value={formData.photo}
                  onChange={(e) => handleInputChange('photo', e.target.value)}
                  placeholder="https://example.com/your-photo.jpg"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2AAC7A] focus:border-transparent"
                />
                <p className="text-sm text-gray-500 mt-2">
                  For demo purposes, use a photo URL from Pexels or similar
                </p>
              </div>

              {formData.photo && (
                <div className="text-center">
                  <img
                    src={formData.photo}
                    alt="Preview"
                    className="w-32 h-32 rounded-full object-cover mx-auto border-4 border-[#2AAC7A]/20"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
              )}

              <div className="bg-[#2AAC7A]/10 rounded-xl p-4">
                <h4 className="font-semibold text-gray-800 mb-2">Personality Assessment</h4>
                <p className="text-sm text-gray-600 mb-4">
                  Help us understand your personality to find better matches
                </p>

                <PersonalitySlider
                  label="Openness"
                  trait="openness"
                  value={formData.personality.openness}
                  description="How open are you to new experiences?"
                />

                <PersonalitySlider
                  label="Extraversion"
                  trait="extraversion"
                  value={formData.personality.extraversion}
                  description="How outgoing and social are you?"
                />

                <PersonalitySlider
                  label="Agreeableness"
                  trait="agreeableness"
                  value={formData.personality.agreeableness}
                  description="How cooperative and trusting are you?"
                />

                <PersonalitySlider
                  label="Conscientiousness"
                  trait="conscientiousness"
                  value={formData.personality.conscientiousness}
                  description="How organized and disciplined are you?"
                />

                <PersonalitySlider
                  label="Emotional Stability"
                  trait="neuroticism"
                  value={100 - formData.personality.neuroticism}
                  description="How emotionally stable and calm are you?"
                />
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-r from-[#FF6B6B] to-[#6C5CE7] rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🎭</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Your Taste Profile</h2>
              <p className="text-gray-600">Help us understand your cultural preferences</p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Favorite Movies
                </label>
                <textarea
                  value={formData.tastePreferences.movies}
                  onChange={(e) => handleTasteChange('movies', e.target.value)}
                  placeholder="e.g., Blade Runner 2049, The Grand Budapest Hotel, Parasite"
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2AAC7A] focus:border-transparent resize-none"
                />
                <p className="text-xs text-gray-500 mt-1">Separate with commas</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Music & Artists
                </label>
                <textarea
                  value={formData.tastePreferences.music}
                  onChange={(e) => handleTasteChange('music', e.target.value)}
                  placeholder="e.g., Tame Impala, Radiohead, Frank Ocean, Billie Eilish"
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2AAC7A] focus:border-transparent resize-none"
                />
                <p className="text-xs text-gray-500 mt-1">Artists, bands, or songs you love</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Favorite Books
                </label>
                <textarea
                  value={formData.tastePreferences.books}
                  onChange={(e) => handleTasteChange('books', e.target.value)}
                  placeholder="e.g., Norwegian Wood, The Midnight Library, Dune"
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2AAC7A] focus:border-transparent resize-none"
                />
                <p className="text-xs text-gray-500 mt-1">Books that shaped your perspective</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  TV Shows & Series
                </label>
                <textarea
                  value={formData.tastePreferences.tvShows}
                  onChange={(e) => handleTasteChange('tvShows', e.target.value)}
                  placeholder="e.g., Breaking Bad, The Office, Stranger Things, Black Mirror"
                  rows={2}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2AAC7A] focus:border-transparent resize-none"
                />
                <p className="text-xs text-gray-500 mt-1">Shows you binge-watch</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Favorite Genres
                  </label>
                  <input
                    type="text"
                    value={formData.tastePreferences.genres}
                    onChange={(e) => handleTasteChange('genres', e.target.value)}
                    placeholder="Sci-fi, Romance, Thriller"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2AAC7A] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Favorite Artists
                  </label>
                  <input
                    type="text"
                    value={formData.tastePreferences.artists}
                    onChange={(e) => handleTasteChange('artists', e.target.value)}
                    placeholder="Painters, Musicians, etc."
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2AAC7A] focus:border-transparent"
                  />
                </div>
              </div>

              <div className="bg-[#2AAC7A]/10 rounded-xl p-4">
                <h4 className="font-semibold text-gray-800 mb-2">💡 Why we ask</h4>
                <p className="text-sm text-gray-600">
                  Your taste preferences help us find people who share your cultural interests and suggest perfect date ideas based on what you both love.
                </p>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const getStepGradient = () => {
    switch (currentStep) {
      case 1: return 'from-blue-50 to-purple-50';
      case 2: return 'from-orange-50 to-pink-50';
      case 3: return 'from-purple-50 to-pink-50';
      case 4: return 'from-green-50 to-blue-50';
      case 5: return 'from-pink-50 to-purple-50';
      default: return 'from-blue-50 to-purple-50';
    }
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br ${getStepGradient()} pt-16 pb-6`}>
      <div className="max-w-md mx-auto">
        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-600">Step {currentStep} of {totalSteps}</span>
            <span className="text-sm font-medium text-[#2AAC7A]">{Math.round((currentStep / totalSteps) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-[#2AAC7A] to-[#6C5CE7] h-2 rounded-full transition-all duration-500"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        {/* Step content */}
        <div className="bg-white rounded-2xl p-6 shadow-lg mb-8">
          {renderStep()}
          
          {/* Error display */}
          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}
        </div>

        {/* Navigation buttons */}
        <div className="flex space-x-4">
          {currentStep > 1 && (
            <button
              onClick={() => setCurrentStep(currentStep - 1)}
              className="flex-1 py-3 border border-gray-200 text-gray-600 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
            >
              Back
            </button>
          )}
          
          <button
            onClick={handleNext}
            disabled={!canProceed() || isSubmitting}
            className="flex-1 py-3 bg-gradient-to-r from-[#2AAC7A] to-[#6C5CE7] text-white rounded-xl font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2"
          >
            {isSubmitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Creating Profile...</span>
              </>
            ) : (
              <>
                <span>{currentStep === totalSteps ? 'Complete Profile' : 'Next'}</span>
                <ArrowRight size={20} />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileSetup;