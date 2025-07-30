'use client';

import { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { TwitterPost } from '../interfaces/TwitterPost';
import { LaunchedToken } from '../interfaces/LaunchedToken';
import { submitBonkTransaction } from '../launchpad/bonk/submitBonkTransaction';
import { VersionedTransaction } from '@solana/web3.js';
import { 
  BONK_DEFAULT_DECIMALS, 
  PUMP_DEFAULT_DECIMALS 
} from '../launchpad/consts';
import { connection } from '../launchpad/connection';
import { launchpads } from '../interfaces/launchpad/launchpads';
import { urlToFile } from '../utils/urlToFile';

interface LaunchModalProps {
  post: TwitterPost;
  onClose: () => void;
}

interface ImageOption {
  type: 'avatar' | 'post' | 'uploaded';
  file?: File | null;
  label: string;
  fallback?: string;
  url?: string; // For display purposes only
}

export default function LaunchModal({ post, onClose }: LaunchModalProps) {
  const { publicKey, connected, signTransaction } = useWallet();
  
  const [availableImages, setAvailableImages] = useState<ImageOption[]>([]);
  const [isLoadingImages, setIsLoadingImages] = useState(true);
  
  const [formData, setFormData] = useState({
    name: '',
    symbol: '',
    description: '',
    website: '',
    twitterUrl: `https://x.com/${post.handle.replace('@', '')}/status/1950048776325849294`,
    selectedImage: 0,
    selectedPlatform: 'pump',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set());

  // Initialize available images with File/Blob objects
  useEffect(() => {
    const loadImages = async () => {
      setIsLoadingImages(true);
      const images: ImageOption[] = [];

      // Add avatar image
      if (post.avatar) {
        const avatarFile = await urlToFile(post.avatar, 'avatar.jpg');
        images.push({
          type: 'avatar',
          file: avatarFile,
          label: 'Profile Photo',
          fallback: post.author.charAt(0).toUpperCase(),
          url: avatarFile ? URL.createObjectURL(avatarFile) : undefined
        });
      }

      // Add post image if available
      if (post.image) {
        const postImageFile = await urlToFile(post.image, 'post-image.jpg');
        images.push({
          type: 'post',
          file: postImageFile,
          label: 'Post Image',
          url: postImageFile ? URL.createObjectURL(postImageFile) : undefined
        });
      }

      setAvailableImages(images);
      setIsLoadingImages(false);
    };

    loadImages();

    // Cleanup object URLs on unmount
    return () => {
      availableImages.forEach(img => {
        if (img.url && img.url.startsWith('blob:')) {
          URL.revokeObjectURL(img.url);
        }
      });
    };
  }, [post.avatar, post.image]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const objectUrl = URL.createObjectURL(file);
      const newImage: ImageOption = {
        type: 'uploaded',
        file: file,
        label: file.name,
        url: objectUrl
      };
      
      setAvailableImages(prev => {
        const updated = [...prev, newImage];
        setFormData(prevForm => ({
          ...prevForm,
          selectedImage: updated.length - 1
        }));
        return updated;
      });
    }
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

  const handleLaunch = async (solBuyAmount: number) => {
    if (!formData.name || !formData.symbol) {
      setError('Name and symbol are required');
      return;
    }

    if (!connected || !publicKey) {
      setError('Please connect your wallet first');
      return;
    }

    const selectedImageOption = availableImages[formData.selectedImage];
    const imageToUse = selectedImageOption?.file || null;

    setIsLoading(true);
    setError(null);

    try {
      if (formData.selectedPlatform === 'bonk') {
        const formDataToSend = new FormData();
        formDataToSend.append('params', JSON.stringify({
          name: formData.name,
          symbol: formData.symbol,
          decimals: BONK_DEFAULT_DECIMALS,
          description: formData.description || '',
          uri: '',
          website: formData.website || '',
          twitter: formData.twitterUrl || ''
        }));
        formDataToSend.append('walletPublicKey', publicKey.toString());
        formDataToSend.append('solBuyAmount', solBuyAmount.toString());
        
        if (imageToUse) {
          formDataToSend.append('image', imageToUse);
        }

        // Call the API route instead of the client-side function
        const response = await fetch('/api/launchpad/bonk', {
          method: 'POST',
          body: formDataToSend
        });

        const result = await response.json();

        // Deserialize the transaction from base64
        if (result.success && result.transaction) {
          // Convert base64 to Uint8Array for browser compatibility
          const binaryString = atob(result.transaction);
          const transactionBuffer = new Uint8Array(binaryString.length);
          for (let i = 0; i < binaryString.length; i++) {
            transactionBuffer[i] = binaryString.charCodeAt(i);
          }
          result.transaction = VersionedTransaction.deserialize(transactionBuffer);
        }

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
            solBuyAmount,
            timestamp: new Date().toISOString(),
            website: formData.website,
            twitterUrl: formData.twitterUrl,
          };
          
          saveTokenToLocalStorage(launchedToken);
          console.log('Token launched successfully:', { txId, mint: result.mint });
          onClose();
        } else {
          setError(result.error || 'Failed to prepare transaction');
        }
      } else if (formData.selectedPlatform === 'pump') {
        const formDataToSend = new FormData();
        formDataToSend.append('params', JSON.stringify({
          name: formData.name,
          symbol: formData.symbol,
          decimals: PUMP_DEFAULT_DECIMALS, 
          description: formData.description || '',
          uri: '',
          website: formData.website || '',
          twitter: formData.twitterUrl || ''
        }));
        formDataToSend.append('walletPublicKey', publicKey.toString());
        formDataToSend.append('solBuyAmount', solBuyAmount.toString());
        
        if (imageToUse) {
          formDataToSend.append('image', imageToUse);
        }

        const response = await fetch('/api/launchpad/pump', {
          method: 'POST',
          body: formDataToSend
        });

        const result = await response.json();

        // Deserialize the transaction from base64
        if (result.success && result.transaction) {
          // Convert base64 to Uint8Array for browser compatibility
          const binaryString = atob(result.transaction);
          const transactionBuffer = new Uint8Array(binaryString.length);
          for (let i = 0; i < binaryString.length; i++) {
            transactionBuffer[i] = binaryString.charCodeAt(i);
          }
          result.transaction = VersionedTransaction.deserialize(transactionBuffer);
        }

        if (result.success && result.transaction) {
          // Sign the transaction with the user's wallet
          if (!signTransaction) {
            setError('Wallet does not support transaction signing');
            return;
          }
          
          const signedTransaction = await signTransaction(result.transaction);
          
          // Send the signed transaction to the blockchain
          const txId = await connection.sendTransaction(signedTransaction, { skipPreflight: true });
          
          // Save the launched token to localStorage
          const launchedToken: LaunchedToken = {
            id: `${result.tokenAddress}_${Date.now()}`,
            name: formData.name,
            symbol: formData.symbol,
            description: formData.description,
            mint: result.tokenAddress,
            txId,
            platform: 'pump',
            solBuyAmount,
            timestamp: new Date().toISOString(),
            website: formData.website,
            twitterUrl: formData.twitterUrl,
          };
          
          saveTokenToLocalStorage(launchedToken);
          console.log('Token launched successfully:', { txId, mint: result.tokenAddress });
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
            {isLoadingImages ? (
              <div className="flex items-center space-x-2 mb-2">
                <div className="animate-spin w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full"></div>
                <span className="text-gray-400 text-sm">Loading images...</span>
              </div>
            ) : null}
            <div className="flex space-x-2 items-center flex-wrap gap-2">
              {availableImages.map((img, index) => (
                <div
                  key={`${img.type}-${index}`}
                  onClick={() => setFormData(prev => ({ ...prev, selectedImage: index }))}
                  className={`w-16 h-16 rounded-full border-2 cursor-pointer flex items-center justify-center overflow-hidden ${
                    formData.selectedImage === index
                      ? 'border-blue-500 bg-blue-500 bg-opacity-20'
                      : 'border-gray-600 bg-gray-800'
                  }`}
                >
                  {img.url && img.file && !imageErrors.has(index) ? (
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
            </div>
            {availableImages.length > 0 && (
              <div className="text-sm text-gray-400 mt-2">
                Selected: {availableImages[formData.selectedImage]?.label || 'None'}
              </div>
            )}
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
                  <img 
                    src={platform.icon} 
                    alt={platform.name}
                    className="w-12 h-12 object-contain"
                  />
                  <span>{platform.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex space-x-3 mt-6">
          {[0.01, 1, 3, 5].map((solBuyAmount) => {
            const selectedPlatform = launchpads.find((platform) => platform.id === formData.selectedPlatform);
            return (
              <button
                key={solBuyAmount}
                onClick={() => handleLaunch(solBuyAmount)}
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
                    <img 
                      src={selectedPlatform?.icon} 
                      alt={selectedPlatform?.name}
                      className="w-5 h-5 object-contain"
                    />
                    <span>{solBuyAmount} SOL</span>
                  </>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
} 