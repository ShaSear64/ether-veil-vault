import { createConfig, http } from 'wagmi'
import { sepolia, mainnet } from 'wagmi/chains'
import { injected, metaMask, walletConnect, coinbaseWallet } from 'wagmi/connectors'

// Get projectId from https://cloud.walletconnect.com
export const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || 'e08e99d213c331aa0fd00f625de06e66'

// Create wagmi config
export const config = createConfig({
  chains: [sepolia, mainnet],
  connectors: [
    injected(),
    metaMask(),
    coinbaseWallet({
      appName: 'Ether Veil Vault',
      appLogoUrl: 'https://etherveilvault.com/logo.png',
    }),
    walletConnect({ 
      projectId,
      metadata: {
        name: 'Ether Veil Vault',
        description: 'Privacy-Preserving Asset Management Platform',
        url: 'https://etherveilvault.com',
        icons: ['https://etherveilvault.com/logo.png']
      }
    }),
  ],
  transports: {
    [sepolia.id]: http(),
    [mainnet.id]: http(),
  },
})

// Export types
export type Config = typeof config
