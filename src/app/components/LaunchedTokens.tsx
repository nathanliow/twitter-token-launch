'use client';

import { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { LaunchedToken } from '../interfaces/LaunchedToken';

export default function LaunchedTokens() {
  const { publicKey, connected } = useWallet();
  const [launchedTokens, setLaunchedTokens] = useState<LaunchedToken[]>([]);

  // Load launched tokens from localStorage when component mounts or wallet changes
  useEffect(() => {
    if (connected && publicKey) {
      const stored = localStorage.getItem(`launchedTokens_${publicKey.toString()}`);
      if (stored) {
        try {
          setLaunchedTokens(JSON.parse(stored));
        } catch (error) {
          console.error('Failed to load launched tokens:', error);
        }
      }
    } else {
      setLaunchedTokens([]);
    }
  }, [connected, publicKey]);

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  if (!connected) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Your Launched Tokens</h2>
        <div className="text-center py-8">
          <div className="text-gray-400 mb-4">
            <span className="text-4xl">🔐</span>
          </div>
          <p className="text-gray-500 dark:text-gray-400">
            Connect your wallet to see your launched tokens
          </p>
        </div>
      </div>
    );
  }

  if (launchedTokens.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Your Launched Tokens</h2>
        <div className="text-center py-8">
          <div className="text-gray-400 mb-4">
            <span className="text-4xl">🚀</span>
          </div>
          <p className="text-gray-500 dark:text-gray-400 mb-2">
            No tokens launched yet
          </p>
          <p className="text-sm text-gray-400">
            Launch your first token from a Twitter post to get started!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
        Your Launched Tokens ({launchedTokens.length})
      </h2>
      
      <div className="space-y-4 max-h-[600px] overflow-y-auto">
        {launchedTokens.map((token) => (
          <div 
            key={token.id} 
            className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {token.name}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  ${token.symbol}
                </p>
              </div>
              <div className="flex items-center space-x-1">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  token.platform === 'bonk' 
                    ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
                    : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                }`}>
                  {token.platform === 'bonk' ? "Let's Bonk" : 'Pump.Fun'}
                </span>
              </div>
            </div>
            
            {token.description && (
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                {token.description}
              </p>
            )}
            
            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
              <span>{formatDate(token.timestamp)}</span>
              <span>{token.solBuyAmount} SOL</span>
            </div>
            
            <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-600">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500 dark:text-gray-400">
                  Mint: {truncateAddress(token.mint)}
                </span>
                <div className="flex space-x-2">
                  {token.twitterUrl && (
                    <a
                      href={token.twitterUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:text-blue-600 underline"
                    >
                      Tweet
                    </a>
                  )}
                  <a
                    href={`https://solscan.io/tx/${token.txId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:text-blue-600 underline"
                  >
                    View TX
                  </a>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 