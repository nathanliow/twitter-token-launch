import { VersionedTransaction } from "@solana/web3.js";
import axios from "axios";
import { MINT_HOST } from "./consts";
import { txToBase64 } from "@raydium-io/raydium-sdk-v2";

export async function submitBonkTransaction (signedTransaction: VersionedTransaction) {
  try {
    // Send the signed transaction to Bonk platform for registration
    const { data } = await axios.post(`${MINT_HOST}/create/sendTransaction`, {
      txs: [txToBase64(signedTransaction)],
    })
    
    return {
      success: true,
      data
    }

  } catch (error) {
    console.error('Error submitting to Bonk platform:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to submit to Bonk platform'
    }
  }
}