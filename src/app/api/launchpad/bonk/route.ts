import { NextRequest, NextResponse } from 'next/server';
import { createBonkMint } from '../../../launchpad/bonk/createBonkMint';
import { PublicKey } from '@solana/web3.js';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    const paramsString = formData.get('params') as string;
    const walletPublicKey = formData.get('walletPublicKey') as string;
    const solBuyAmount = parseFloat(formData.get('solBuyAmount') as string);
    const imageFile = formData.get('image') as File | null;

    if (!paramsString || !walletPublicKey || isNaN(solBuyAmount)) {
      return NextResponse.json(
        { success: false, error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    const params = JSON.parse(paramsString);
    
    const publicKey = new PublicKey(walletPublicKey);

    const result = await createBonkMint({
      params: {
        ...params,
        image: imageFile
      },
      walletPublicKey: publicKey,
      solBuyAmount
    });

    if (result.success && 'transaction' in result) {
      const serializedTransaction = Buffer.from(result.transaction.serialize()).toString('base64');
      
      return NextResponse.json({
        success: true,
        transaction: serializedTransaction,
        mint: result.mint
      });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('API error in bonk mint creation:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown server error' 
      },
      { status: 500 }
    );
  }
} 