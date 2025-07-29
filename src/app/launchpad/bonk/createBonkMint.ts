import {
  TxVersion,
  LaunchpadConfig,
  LAUNCHPAD_PROGRAM,
  LaunchpadPoolInitParam
} from '@raydium-io/raydium-sdk-v2'
import { initSdk } from './config'
import BN from 'bn.js'
import { 
  LAMPORTS_PER_SOL, 
  PublicKey, 
  VersionedTransaction 
} from '@solana/web3.js'
import axios from 'axios'
import { 
  BONK_PLATFORM_ID_2, 
  configRes,
  MINT_HOST 
} from './consts'
import { CreateAndBuyMint } from '../../interfaces/launchpad/bonk/CreateMint'

interface CreateBonkMintProps {
  params: CreateAndBuyMint;
  walletPublicKey: PublicKey;
  solAmount: number;
}

export async function createBonkMint ({ params, walletPublicKey, solAmount }: CreateBonkMintProps): Promise<{
  success: boolean;
  transaction: VersionedTransaction;
  mint: string;
  metadataLink: string;
  error?: string;
} | {
  success: false;
  error: string;
}> {
  try {
    const raydium = await initSdk(walletPublicKey)
    const owner = raydium.ownerPubKey

    const programId = LAUNCHPAD_PROGRAM

    const configs = configRes.data.data[0].key
    const configInfo: ReturnType<typeof LaunchpadConfig.decode> = {
      index: configs.index,
      mintB: new PublicKey(configs.mintB),
      tradeFeeRate: new BN(configs.tradeFeeRate),
      epoch: new BN(configs.epoch),
      curveType: configs.curveType,
      migrateFee: new BN(configs.migrateFee),
      maxShareFeeRate: new BN(configs.maxShareFeeRate),
      minSupplyA: new BN(configs.minSupplyA),
      maxLockRate: new BN(configs.maxLockRate),
      minSellRateA: new BN(configs.minSellRateA),
      minMigrateRateA: new BN(configs.minMigrateRateA),
      minFundRaisingB: new BN(configs.minFundRaisingB),
      protocolFeeOwner: new PublicKey(configs.protocolFeeOwner),
      migrateFeeOwner: new PublicKey(configs.migrateFeeOwner),
      migrateToAmmWallet: new PublicKey(configs.migrateToAmmWallet),
      migrateToCpmmWallet: new PublicKey(configs.migrateToCpmmWallet),
    }

    const configId = new PublicKey(configRes.data.data[0].key.pubKey)
    const mintBInfo = configRes.data.data[0].mintInfoB

    const newMintData = {
      wallet: owner.toBase58(),
      name: params.name,
      symbol: params.symbol,
      configId: configId.toString(),
      decimals: params.decimals,
      supply: LaunchpadPoolInitParam.supply, 
      totalSellA: LaunchpadPoolInitParam.totalSellA, 
      totalFundRaisingB: LaunchpadPoolInitParam.totalFundRaisingB,
      totalLockedAmount: LaunchpadPoolInitParam.totalLockedAmount,
      cliffPeriod: LaunchpadPoolInitParam.cliffPeriod,
      unlockPeriod: LaunchpadPoolInitParam.unlockPeriod,
      platformId: new PublicKey(BONK_PLATFORM_ID_2),
      migrateType: 'amm', // or cpmm
      description: params.description,
    }

    if (params.website && params.website.trim()) {
      // @ts-ignore
      newMintData.website = params.website
    }
    if (params.twitter && params.twitter.trim()) {
      // @ts-ignore
      newMintData.twitter = params.twitter
    }

    const form = new FormData()
    Object.keys(newMintData).forEach((key) => {
      // @ts-ignore
      form.append(key, newMintData[key])
    })

    if (params.image) {
      form.append('file', params.image, params.image.name)
    } else {
      const canvas = document.createElement('canvas')
      canvas.width = 400
      canvas.height = 400
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.fillStyle = '#1f2937'
        ctx.fillRect(0, 0, 400, 400)
        ctx.fillStyle = '#9ca3af'
        ctx.font = '48px Arial'
        ctx.textAlign = 'center'
        ctx.fillText('🪙', 200, 220)
      }
      
      const dataURL = canvas.toDataURL('image/png')
      const blob = await fetch(dataURL).then(res => res.blob())
      form.append('file', blob, 'default-token-icon.png')
    }

    const randomMint: {
      data: {
        id: string
        success: boolean
        data: { mint: string; metadataLink: string }
      }
    } = await axios.post(`${MINT_HOST}/create/get-random-mint`, form, {
      headers: { 'Content-Type': 'multipart/form-data', 'ray-token': `token-${Date.now()}` },
    })

    const mintA = new PublicKey(randomMint.data.data.mint)

    const { transactions } = await raydium.launchpad.createLaunchpad({
      programId,
      mintA,
      decimals: newMintData.decimals,
      name: newMintData.name,
      symbol: newMintData.symbol,
      uri: randomMint.data.data.metadataLink,
      configId,
      configInfo,
      migrateType: newMintData.migrateType as 'amm' | 'cpmm',
      mintBDecimals: mintBInfo.decimals,

      platformId: newMintData.platformId,
      txVersion: TxVersion.V0,
      slippage: new BN(100), // 100 = 1%
      buyAmount: new BN(solAmount * LAMPORTS_PER_SOL), 
      createOnly: false,

      supply: newMintData.supply, 
      totalSellA: newMintData.totalSellA, 
      totalFundRaisingB: newMintData.totalFundRaisingB, 
      totalLockedAmount: newMintData.totalLockedAmount,
      cliffPeriod: newMintData.cliffPeriod, 
      unlockPeriod: newMintData.unlockPeriod,
    })

    const transaction = transactions[0]

    return {
      success: true,
      transaction,
      mint: randomMint.data.data.mint,
      metadataLink: randomMint.data.data.metadataLink,
    }

  } catch (error) {
    console.error(error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}