export interface MintConfig {
  name: string;
  symbol: string;
  decimals?: number;
  description: string;
  uri: string;
  website?: string;
  twitter?: string;
  telegram?: string;
  image?: File | string;
}