export interface LaunchedToken {
  id: string;
  name: string;
  symbol: string;
  description?: string;
  mint: string;
  txId: string;
  platform: 'bonk' | 'pump';
  solAmount: number;
  timestamp: string;
  website?: string;
  twitterUrl?: string;
  metadataLink?: string;
} 