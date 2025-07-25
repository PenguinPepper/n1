import React from 'react';
import { Heart, Sparkles, Brain, Music } from 'lucide-react';

interface LandingProps {
  onGetStarted: () => void;
}

const Landing: React.FC<LandingProps> = ({ onGetStarted }) => {
  const features = [
    {
      icon: Brain,
      title: 'Smart Matching',
      description: 'AI-powered insights explain why you match'
    },
    {
      icon: Sparkles,
      title: 'Date Concierge',
      description: 'Personalized date ideas just for you'
    },
    {
      icon: Music,
      title: 'Vibe Check',
      description: 'Find people sharing your current mood'
    },
    {
      icon: Heart,
      title: 'Taste Explorer',
      description: 'Discover culture through shared interests'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-500 via-emerald-400 to-purple-500 flex flex-col items-center justify-center p-6 text-white">
      <div className="text-center max-w-md mx-auto">
        <div className="mb-8">
          <h1 className="text-6xl font-bold mb-2 tracking-tight">n1</h1>
          <p className="text-xl opacity-90 font-light">
            Where culture meets connection
          </p>
        </div>

        <div className="space-y-6 mb-12">
          {features.map((feature, index) => (
            <div
              key={index}
              className="flex items-center space-x-4 bg-white/10 backdrop-blur-sm rounded-xl p-4 transform hover:scale-105 transition-all duration-300"
            >
              <div className="bg-white/20 rounded-lg p-3">
                <feature.icon size={24} />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-lg">{feature.title}</h3>
                <p className="text-sm opacity-80">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={onGetStarted}
          className="w-full bg-white text-emerald-500 py-4 rounded-2xl font-bold text-lg hover:bg-gray-50 transform hover:scale-105 transition-all duration-300 shadow-xl"
        >
          Join now
        </button>

        <p className="text-sm opacity-70 mt-6">
          Already have an account?{' '}
          <a href="#" className="text-white font-semibold">
            Log in
          </a>
        </p>
      </div>
    </div>
  );
};

export default Landing;