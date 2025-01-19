import { createConfig, http } from 'wagmi';
import {bsc } from 'wagmi/chains';

import { 
    rainbowWallet,
    metaMaskWallet,
    trustWallet,
    walletConnectWallet,
    coinbaseWallet,
    argentWallet,
    ledgerWallet,
    safeWallet,
    braveWallet,
    imTokenWallet,
    injectedWallet,
    omniWallet,
} from '@rainbow-me/rainbowkit/wallets';
import { connectorsForWallets } from '@rainbow-me/rainbowkit';

const projectId = 'c87b9758c721b75cf076ef3cc19ddd58'; // Get from https://cloud.walletconnect.com/

const connectors = connectorsForWallets(
  [
    {
      groupName: 'Mobile Friendly',
      wallets: [
        walletConnectWallet,
        trustWallet,
        rainbowWallet,
        metaMaskWallet,
      ],
    },
    {
      groupName: 'Other',
      wallets: [
        coinbaseWallet,
        argentWallet,
        ledgerWallet,
        safeWallet,
        braveWallet,
        imTokenWallet,
        injectedWallet,
        omniWallet,
      ],
    },
  ],
  {
    projectId,
    appName: 'Tinseltoken',
    chains: [bsc], // Prioritize bsc
    initialChain: bsc.id,
  }
);

export const config = createConfig({
  connectors,
  chains: [bsc],
  transports: {
    [bsc.id]: http(),

  },
});