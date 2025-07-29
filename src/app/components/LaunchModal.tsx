'use client';

import { useState } from 'react';
import { TwitterPost } from '../interfaces/TwitterPost';

interface LaunchModalProps {
  post: TwitterPost;
  onClose: () => void;
}

export default function LaunchModal({ post, onClose }: LaunchModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    symbol: '',
    website: '',
    twitterUrl: `https://x.com/${post.handle.replace('@', '')}/status/1950048776325849294`,
    selectedImage: 0,
    selectedPlatform: 'pump'
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleLaunch = (solAmount: number) => {
    console.log('Launching token with:', { ...formData, solAmount });
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="bg-gray-900 rounded-lg max-w-2xl w-full p-6 text-white max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-bold mb-2">Launch Token</h2>
            <p className="text-gray-300 text-sm">Configure your token and launch it instantly.</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-xl font-bold"
          >
            ×
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Name</label>
            <div className="relative">
              <input
                type="text"
                placeholder="Token name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                maxLength={32}
                className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
              />
              <span className="absolute right-3 top-2 text-gray-400 text-sm">
                {formData.name.length}/32
              </span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Symbol</label>
            <div className="relative">
              <input
                type="text"
                placeholder="Symbol"
                value={formData.symbol}
                onChange={(e) => handleInputChange('symbol', e.target.value)}
                maxLength={10}
                className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
              />
              <span className="absolute right-3 top-2 text-gray-400 text-sm">
                {formData.symbol.length}/10
              </span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Website (optional)</label>
            <input
              type="url"
              placeholder="https://example.com"
              value={formData.website}
              onChange={(e) => handleInputChange('website', e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Twitter URL</label>
            <div className="flex items-center space-x-2">
              <input
                type="url"
                value={formData.twitterUrl}
                onChange={(e) => handleInputChange('twitterUrl', e.target.value)}
                className="flex-1 bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
              />
              <a
                href={formData.twitterUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 text-sm flex items-center"
              >
                View Tweet ↗
              </a>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Select Image</label>
            <div className="flex space-x-2">
              {[0, 1, 2].map((index) => (
                <div
                  key={index}
                  onClick={() => handleInputChange('selectedImage', index.toString())}
                  className={`w-16 h-16 rounded border-2 cursor-pointer flex items-center justify-center ${
                    formData.selectedImage === index
                      ? 'border-blue-500 bg-blue-500 bg-opacity-20'
                      : 'border-gray-600 bg-gray-800'
                  }`}
                >
                  {index === 0 ? (
                    <span className="text-gray-400">📷</span>
                  ) : (
                    <span className="text-gray-400">👤</span>
                  )}
                </div>
              ))}
              <button className="w-16 h-16 bg-gray-800 border border-gray-600 rounded flex items-center justify-center hover:bg-gray-700">
                <span className="text-gray-400">⬆️</span>
              </button>
              <button className="w-16 h-16 bg-gray-800 border border-gray-600 rounded flex items-center justify-center hover:bg-gray-700">
                <span className="text-gray-400">🔍</span>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Platform</label>
            <p className="text-gray-400 text-sm mb-3">Pump.Fun</p>
            <div className="flex space-x-2">
              {[
                { id: 'pump', name: 'Pump', icon: '🟢' },
                { id: 'bonk', name: 'Bonk', icon: '🟠' },
                { id: 'jupiter', name: 'Jupiter', icon: '🟢' }
              ].map((platform) => (
                <button
                  key={platform.id}
                  onClick={() => handleInputChange('selectedPlatform', platform.id)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-full border ${
                    formData.selectedPlatform === platform.id
                      ? 'bg-blue-500 border-blue-500 text-white'
                      : 'bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  <span>{platform.icon}</span>
                  <span>{platform.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex space-x-3 mt-6">
          {[1, 3, 5].map((sol) => (
            <button
              key={sol}
              onClick={() => handleLaunch(sol)}
              className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-3 px-4 rounded font-medium transition-colors flex items-center justify-center space-x-2"
            >
              <span>→</span>
              <span>{sol} SOL</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
} 