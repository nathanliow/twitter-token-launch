export interface CreateAndBuyMint {
  name: string;
  symbol: string;
  decimals: number;
  description: string;
  uri: string;
  website?: string;
  twitter?: string;
  image?: File;
}