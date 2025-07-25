import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Send, Smile, Camera, Heart } from 'lucide-react';
import type { User, ChatMessage } from '../types';
import { generateMockChatMessages } from '../utils/mockData';

interface ChatScreenProps {
  user: User;
  onBack: () => void;
}

const ChatScreen: React.FC<ChatScreenProps> = ({ user, onBack }) => {
  const [messages, setMessages] = useState<ChatMessage[]>(() => generateMockChatMessages(user.id));
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const message: ChatMessage = {
      id: `msg-${Date.now()}`,
      senderId: 'current-user',
      text: newMessage,
      timestamp: new Date(),
      type: 'text'
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');

    // Simulate typing indicator and response
    setIsTyping(true);
    setTimeout(() => {
      const responses = [
        "That's so interesting! Tell me more 😊",
        "I totally agree with you on that!",
        "Haha, you're so funny! 😄",
        "That sounds amazing! I'd love to try that",
        "You have such great taste! ✨"
      ];
      
      const response: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        senderId: user.id,
        text: responses[Math.floor(Math.random() * responses.length)],
        timestamp: new Date(),
        type: 'text'
      };

      setMessages(prev => [...prev, response]);
      setIsTyping(false);
    }, 2000);
  };

  const formatTime = (timestamp: Date) => {
    return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const MessageBubble: React.FC<{ message: ChatMessage; isOwn: boolean }> = ({ message, isOwn }) => (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-4`}>
      {!isOwn && (
        <img
          src={user.photos[0]}
          alt={user.name}
          className="w-8 h-8 rounded-full mr-3 mt-auto"
        />
      )}
      <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
        isOwn 
          ? 'bg-gradient-to-r from-[#2AAC7A] to-[#6C5CE7] text-white rounded-br-md' 
          : 'bg-gray-100 text-gray-800 rounded-bl-md'
      }`}>
        <p className="text-sm">{message.text}</p>
        <p className={`text-xs mt-1 ${isOwn ? 'text-white/70' : 'text-gray-500'}`}>
          {formatTime(message.timestamp)}
        </p>
      </div>
    </div>
  );

  const TypingIndicator: React.FC = () => (
    <div className="flex justify-start mb-4">
      <img
        src={user.photos[0]}
        alt={user.name}
        className="w-8 h-8 rounded-full mr-3 mt-auto"
      />
      <div className="bg-gray-100 rounded-2xl rounded-bl-md px-4 py-3">
        <div className="flex space-x-1">
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 px-4 py-3 flex items-center space-x-3">
        <button
          onClick={onBack}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft size={20} className="text-gray-600" />
        </button>
        
        <img
          src={user.photos[0]}
          alt={user.name}
          className="w-10 h-10 rounded-full object-cover"
        />
        
        <div className="flex-1">
          <h2 className="font-semibold text-gray-800">{user.name}</h2>
          <p className="text-sm text-gray-500">
            {user.currentVibe ? `Listening to ${user.currentVibe.content.split(' - ')[1] || user.currentVibe.content}` : 'Online'}
          </p>
        </div>

        <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <Heart size={20} className="text-[#FF6B6B]" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 pb-20">
        <div className="max-w-md mx-auto">
          {/* Match notification */}
          <div className="text-center mb-6">
            <div className="bg-gradient-to-r from-[#2AAC7A]/10 to-[#FF6B6B]/10 rounded-2xl p-4 mb-4">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <Heart size={16} className="text-[#FF6B6B]" />
                <span className="text-sm font-medium text-gray-700">You matched with {user.name}!</span>
                <Heart size={16} className="text-[#FF6B6B]" />
              </div>
              <p className="text-xs text-gray-500">Start the conversation and see where it goes</p>
            </div>
          </div>

          {/* Message list */}
          {messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              isOwn={message.senderId === 'current-user'}
            />
          ))}

          {isTyping && <TypingIndicator />}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="bg-white border-t border-gray-200 p-4">
        <div className="max-w-md mx-auto">
          <div className="flex items-center space-x-3">
            <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
              <Camera size={20} />
            </button>
            
            <div className="flex-1 relative">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                className="w-full px-4 py-3 bg-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#2AAC7A] focus:bg-white transition-all"
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              />
              <button className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 transition-colors">
                <Smile size={18} />
              </button>
            </div>

            <button
              onClick={handleSendMessage}
              disabled={!newMessage.trim()}
              className="p-3 bg-gradient-to-r from-[#2AAC7A] to-[#6C5CE7] text-white rounded-full hover:shadow-lg transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatScreen;