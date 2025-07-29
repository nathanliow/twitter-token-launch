import { Raydium, TxVersion } from '@raydium-io/raydium-sdk-v2'
import { Connection, PublicKey } from '@solana/web3.js'

export const connection = new Connection(`https://mainnet.helius-rpc.com/?api-key=${process.env.NEXT_PUBLIC_HELIUS_API_KEY}`)
export const txVersion = TxVersion.V0
const cluster = 'mainnet'

let raydium: Raydium | undefined
export const initSdk = async (walletPublicKey: PublicKey, params?: { loadToken?: boolean }) => {
  if (raydium) return raydium

  raydium = await Raydium.load({
    owner: walletPublicKey,
    connection,
    cluster,
    disableFeatureCheck: true,
    disableLoadToken: !params?.loadToken,
    blockhashCommitment: 'finalized',
  })

  return raydium
}