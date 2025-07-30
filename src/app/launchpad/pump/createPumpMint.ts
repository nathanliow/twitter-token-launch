import BN from "bn.js";
import { 
  PumpSdk, 
  getBuyTokenAmountFromSolAmount 
} from "@pump-fun/pump-sdk";
import { connection } from "../connection";
import { MintConfig } from "../../interfaces/launchpad/MintConfig";
import { createTokenMetadata } from "./createTokenMetadata";
import { 
  Keypair, 
  LAMPORTS_PER_SOL, 
  PublicKey, 
  TransactionMessage, 
  VersionedTransaction 
} from "@solana/web3.js";

interface CreatePumpMintProps {
  params: MintConfig;
  walletPublicKey: PublicKey;
  solBuyAmount: number;
}

export async function createPumpMint({ params, walletPublicKey, solBuyAmount }: CreatePumpMintProps): Promise<{
  success: boolean;
  transaction: VersionedTransaction;
  tokenAddress: string;
  error?: string;
} | {
  success: false;
  error: string;
}> {
  try {
    const pumpSdk = new PumpSdk(connection);
    
    const mint = Keypair.generate();
    
    const metadata = await createTokenMetadata(params);

    const global = await pumpSdk.fetchGlobal();

    const solAmountLamports = new BN(solBuyAmount * LAMPORTS_PER_SOL);
    const tokenAmount = getBuyTokenAmountFromSolAmount(global, null, solAmountLamports);

    const instructions = await pumpSdk.createAndBuyInstructions({
      global: global,
      mint: mint.publicKey,
      name: params.name,
      symbol: params.symbol,
      uri: metadata.metadataUri,
      creator: walletPublicKey,
      user: walletPublicKey,
      amount: tokenAmount,
      solAmount: solAmountLamports,
    });

    const { blockhash } = await connection.getLatestBlockhash();
    
    const messageV0 = new TransactionMessage({
      payerKey: walletPublicKey,
      recentBlockhash: blockhash,
      instructions,
    }).compileToV0Message();
    
    const transaction = new VersionedTransaction(messageV0);
    
    transaction.sign([mint]);
    
    return {
      success: true,
      transaction,
      tokenAddress: mint.publicKey.toString(),
    };

  } catch (error) {
    console.error("Error creating pump mint:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}