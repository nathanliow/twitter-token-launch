'use client';

import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { TwitterPost } from '../interfaces/TwitterPost';
import { LaunchedToken } from '../interfaces/LaunchedToken';
import { createBonkMint } from '../launchpad/bonk/createBonkMint';
import { submitBonkTransaction } from '../launchpad/bonk/submitBonkTransaction';
import { BONK_DECIMALS } from '../launchpad/bonk/consts';
import { connection } from '../launchpad/bonk/config';
import { launchpads } from '../interfaces/launchpad/launchpads';

interface LaunchModalProps {
  post: TwitterPost;
  onClose: () => void;
}

export default function LaunchModal({ post, onClose }: LaunchModalProps) {
  const { publicKey, connected, signTransaction } = useWallet();
  
  const availableImages = [
    { type: 'avatar', url: post.avatar, label: 'Profile Photo', fallback: post.author.charAt(0).toUpperCase() },
    ...(post.image ? [{ type: 'post', url: post.image, label: 'Post Image' }] : []),
  ];
  
  const [formData, setFormData] = useState({
    name: '',
    symbol: '',
    description: '',
    website: '',
    twitterUrl: `https://x.com/${post.handle.replace('@', '')}/status/1950048776325849294`,
    selectedImage: 0,
    selectedPlatform: 'pump',
    uploadedImage: null as File | null
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set());

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const saveTokenToLocalStorage = (tokenData: LaunchedToken) => {
    if (!publicKey) return;
    
    try {
      const storageKey = `launchedTokens_${publicKey.toString()}`;
      const existing = localStorage.getItem(storageKey);
      const tokens = existing ? JSON.parse(existing) : [];
      
      tokens.unshift(tokenData); 
      localStorage.setItem(storageKey, JSON.stringify(tokens));
    } catch (error) {
      console.error('Failed to save token to localStorage:', error);
    }
  };

  const urlToFile = async (url: string, filename: string): Promise<File> => {
    const response = await fetch(url);
    const blob = await response.blob();
    return new File([blob], filename, { type: blob.type });
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        uploadedImage: file
      }));
    }
  };

  const handleLaunch = async (solAmount: number) => {
    if (!formData.name || !formData.symbol) {
      setError('Name and symbol are required');
      return;
    }

    if (!connected || !publicKey) {
      setError('Please connect your wallet first');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      if (formData.selectedPlatform === 'bonk') {
        const selectedImageData = availableImages[formData.selectedImage];
        let imageToUse: File | undefined = formData.uploadedImage || undefined;
        
        if (!imageToUse && selectedImageData?.url && !imageErrors.has(formData.selectedImage)) {
          try {
            const filename = selectedImageData.type === 'avatar' ? 'avatar.jpg' : 'post-image.jpg';
            imageToUse = await urlToFile(selectedImageData.url, filename);
          } catch (error) {
            console.warn('Failed to convert image URL to file:', error);
          }
        }

        const result = await createBonkMint({
          params: {
            name: formData.name,
            symbol: formData.symbol,
            decimals: BONK_DECIMALS,
            description: formData.description || '',
            uri: '',
            website: formData.website || '',
            twitter: formData.twitterUrl || '',
            image: imageToUse
          },
          walletPublicKey: publicKey,
          solAmount: solAmount
        });

        if (result.success && result.transaction) {
          // First, sign the transaction with the user's wallet
          if (!signTransaction) {
            setError('Wallet does not support transaction signing');
            return;
          }
          
          const signedTransaction = await signTransaction(result.transaction);
          
          // Submit the signed transaction to Bonk platform for registration
          const bonkResult = await submitBonkTransaction(signedTransaction);
          if (!bonkResult.success) {
            setError(bonkResult.error || 'Failed to register with Bonk platform');
            return;
          }
          
          // Finally, send the signed transaction to the blockchain
          const txId = await connection.sendTransaction(signedTransaction, { skipPreflight: true });
          
          // Save the launched token to localStorage
          const launchedToken: LaunchedToken = {
            id: `${result.mint}_${Date.now()}`,
            name: formData.name,
            symbol: formData.symbol,
            description: formData.description,
            mint: result.mint,
            txId,
            platform: 'bonk',
            solAmount,
            timestamp: new Date().toISOString(),
            website: formData.website,
            twitterUrl: formData.twitterUrl,
            metadataLink: result.metadataLink
          };
          
          saveTokenToLocalStorage(launchedToken);
          console.log('Token launched successfully:', { txId, mint: result.mint });
          onClose();
        } else {
          setError(result.error || 'Failed to prepare transaction');
        }
      } else {
        onClose();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to launch token');
    } finally {
      setIsLoading(false);
    }
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
            x
          </button>
        </div>

        {error && (
          <div className="bg-red-500 bg-opacity-20 border border-red-500 rounded p-3 mb-4">
            <p className="text-red-200 text-sm">{error}</p>
          </div>
        )}

        <div className="space-y-4">
          <div className="flex space-x-3">
            <div className="flex-1 w-2/3">
              <label className="block text-sm font-medium mb-2">Name *</label>
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

            <div className="flex-1 w-1/3">
              <label className="block text-sm font-medium mb-2">Symbol *</label>
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
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <textarea
              placeholder="Describe your token..."
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              maxLength={500}
              rows={3}
              className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 resize-none"
            />
            <div className="text-right text-gray-400 text-sm mt-1">
              {formData.description.length}/500
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
            <label className="block text-sm font-medium mb-2">Token Image</label>
            <div className="flex space-x-2 items-center">
              {availableImages.map((img, index) => (
                <div
                  key={index}
                  onClick={() => setFormData(prev => ({ ...prev, selectedImage: index }))}
                  className={`w-16 h-16 rounded-full border-2 cursor-pointer flex items-center justify-center overflow-hidden ${
                    formData.selectedImage === index
                      ? 'border-blue-500 bg-blue-500 bg-opacity-20'
                      : 'border-gray-600 bg-gray-800'
                  }`}
                >
                {img.url && !imageErrors.has(index) ? (
                  <img
                    src={img.url}
                    alt={img.label}
                    className="w-full h-full object-cover"
                    onError={() => {
                      setImageErrors(prev => new Set(prev).add(index));
                    }}
                  />
                ) : (
                  <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                    <span className="text-gray-300 font-bold text-lg">
                      {img.fallback || img.label.charAt(0)}
                    </span>
                  </div>
                )}
              </div>
            ))}
            <label className="w-16 h-16 bg-gray-800 border border-gray-600 rounded flex items-center justify-center hover:bg-gray-700 cursor-pointer">
              <span className="text-gray-400">⬆️</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </label>
            {formData.uploadedImage && (
              <div className="text-sm text-green-400">
                ✓ {formData.uploadedImage.name}
              </div>
            )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Platform</label>
            <p className="text-gray-400 text-sm mb-3">
              {launchpads.find((platform) => platform.id === formData.selectedPlatform)?.name}
            </p>
            <div className="flex space-x-2">
              {launchpads.map((platform) => (
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
          {[0, 1, 3, 5].map((sol) => (
            <button
              key={sol}
              onClick={() => handleLaunch(sol)}
              disabled={isLoading}
              className={`flex-1 py-3 px-4 rounded font-medium transition-colors flex items-center justify-center space-x-2 ${
                isLoading 
                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  : 'bg-blue-500 hover:bg-blue-600 text-white'
              }`}
            >
              {isLoading ? (
                <>
                  <div className="animate-spin w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full"></div>
                  <span>Launching...</span>
                </>
              ) : (
                <>
                  <span>→</span>
                  <span>{sol} SOL</span>
                </>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
} 