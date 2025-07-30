import { 
  Raydium, 
  TxVersion 
} from '@raydium-io/raydium-sdk-v2'
import { PublicKey } from '@solana/web3.js'
import { connection } from '../connection'

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