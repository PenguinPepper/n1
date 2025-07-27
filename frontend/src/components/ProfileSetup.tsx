import React, { useState } from 'react';
import { User, Camera, Plus, X, ArrowRight } from 'lucide-react';
import type { User as UserType} from '../types/index';

interface ProfileSetupProps {
  onProfileComplete: (user: UserType) => void;
}

const ProfileSetup: React.FC<ProfileSetupProps> = ({ onProfileComplete }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    bio: '',
    interests: '',
    photo: '',
    personality: {
      openness: 50,
      conscientiousness: 50,
      extraversion: 50,
      agreeableness: 50,
      neuroticism: 50
    }
  });

  const totalSteps = 4;

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
    const user: UserType = {
      id: 'current-user',
      name: formData.name,
      age: parseInt(formData.age),
      photos: [formData.photo],
      bio: formData.bio,
      interests: formData.interests.split(',').map(i => i.trim()).filter(i => i),
      personality: formData.personality
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
              <textarea
                value={formData.bio}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                placeholder="Tell people what makes you unique. What are you passionate about? What's your vibe?"
                maxLength={500}
                rows={6}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2AAC7A] focus:border-transparent resize-none"
              />
              <p className="text-sm text-gray-500 mt-2">Minimum 20 characters</p>
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

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-6">
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
            disabled={!canProceed()}
            className="flex-1 py-3 bg-gradient-to-r from-[#2AAC7A] to-[#6C5CE7] text-white rounded-xl font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2"
          >
            <span>{currentStep === totalSteps ? 'Complete Profile' : 'Next'}</span>
            <ArrowRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileSetup;