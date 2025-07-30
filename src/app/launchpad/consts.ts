import { PublicKey } from "@solana/web3.js";

// Raydium
export const RAYDIUM_PLATFORM_ADDR = '4Bu96XjU84XjPDSpveTVf6LYGCkfW5FK7SNkREWcEfV4'

// Bonk
export const BONK_PLATFORM_ADDR_1 = 'FfYek5vEz23cMkWsdJwG2oa6EphsvXSHrGpdALN4g6W1'
export const BONK_PLATFORM_ADDR_2 = '8pCtbn9iatQ8493mDQax4xfEUjhoVBpUWYVQoRU18333';
export const BONK_PLATFORM_ADDR_3 = 'BuM6KDpWiTcxvrpXywWFiw45R2RNH8WURdvqoTDV1BW4';
export const MINT_HOST = 'https://launch-mint-v1.raydium.io'
export const BONK_DEFAULT_DECIMALS = 6;
export const BONK_CONFIG_RES = {
  "id": "", // generated on request
  "success": true,
  "data": {
    "data": [
      {
        "key": {
          "name": "Constant Product Curve",
          "pubKey": "6s1xP3hpbAfFoNtUNF8mfHsjr2Bd97JxFJRWLbL6aHuX",
          "epoch": 772,
          "curveType": 0,
          "index": 0,
          "migrateFee": "0",
          "tradeFeeRate": "2500",
          "maxShareFeeRate": "10000",
          "minSupplyA": "10000000",
          "maxLockRate": "300000",
          "minSellRateA": "200000",
          "minMigrateRateA": "200000",
          "minFundRaisingB": "30000000000",
          "protocolFeeOwner": "rayvTLcCMDs7P5tgpuoNA6ZYeLERegeCphdqLSgdKms",
          "migrateFeeOwner": "rayHQtJKrtvqUs3HnhDW9RKubHRbu87eESKEYD5xosa",
          "migrateToAmmWallet": "RAYzrepoBdjSFg7MZj2vy4XBSv2azKRXC72ztUMZMJB",
          "migrateToCpmmWallet": "RAYpQbFNq9i3mu6cKpTKKRwwHFDeK5AuZz8xvxUrCgw",
          "mintB": "So11111111111111111111111111111111111111112"
        },
        "mintInfoB": {
          "chainId": 101,
          "address": "So11111111111111111111111111111111111111112",
          "programId": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
          "logoURI": "https://img-v1.raydium.io/icon/So11111111111111111111111111111111111111112.png",
          "symbol": "WSOL",
          "name": "Wrapped SOL",
          "decimals": 9,
          "tags": [],
          "extensions": {

          }
        }
      }
    ]
  }
}

// Pump.fun 
export const PUMP_PROGRAM_ADDR = new PublicKey('6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P');
export const PUMP_AMM_ADDR = 'pAMMBay6oceH9fJKBRHGP5D4bD4sWpmSwMn52FMfXEA';
export const PUMP_AMM_FEE_ADDR = new PublicKey('G5UZAVbAf46s7cKWoyKu8kYTip9DGTpbLZ2qa9Aq69dP');
export const PUMP_GLOBAL_ADDR = new PublicKey('4wTV1YmiEkRvAtNtsSGPtUrqRYQMe5SKy2uB4Jjaxnjf');
export const PUMP_MINT_AUTH_ADDR = new PublicKey("TSLvdd1pWpHVjahSpsvCXUbgwsL3JAcvokwaKt1eokM");
export const PUMP_EVENT_AUTH_ADDR = new PublicKey('G5UZAVbAf46s7cKWoyKu8kYTip9DGTpbLZ2qa9Aq69dP');
export const PUMP_CREATE_POOL_INSTRUCTION = '181ec828051c0777'; // hex
export const PUMP_BUY_INSTRUCTION = '16927863322537952870'; // hex
export const PUMP_SLIPPAGE_AMT = 5; // 5%
export const PUMP_PRIORITY_FEE = 0.001; // 0.001 SOL
export const PUMP_IPFS_URL = 'https://pump.fun/api/ipfs';
export const PUMP_DEFAULT_DECIMALS = 6;

// Metaplex
export const METAPLEX_METADATA_PROGRAM_ADDR = new PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s');