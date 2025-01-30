// wagmiConfigs.js

import { createConfig, http } from 'wagmi';
import { bscTestnet } from 'wagmi/chains';
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

const projectId = 'c87b9758c721b75cf076ef3cc19ddd58';

// Enhanced mobile detection
const isMobile = typeof window !== 'undefined' && /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

// Deep linking handlers for different wallets
const walletDeepLinks = {
  metamask: (uri) => `metamask://wc?uri=${encodeURIComponent(uri)}`,
  trust: (uri) => `trust://wc?uri=${encodeURIComponent(uri)}`,
  rainbow: (uri) => `rainbow://wc?uri=${encodeURIComponent(uri)}`,
  coinbase: (uri) => `cbwallet://wc?uri=${encodeURIComponent(uri)}`
};

const walletConnectConfig = {
  projectId,
  metadata: {
    name: 'Tinseltoken',
    description: 'Tinseltoken Airdrop Platform',
    url: typeof window !== 'undefined' ? window.location.origin : '',
    icons: ['https://thetinseltoken.com/assets/img/logo/logo.png']
  },
  showQrModal: true,
  qrModalOptions: {
    themeMode: "dark",
    desktopWallets: true,
    mobileWallets: true,
    explorerRecommendedWalletIds: ['metamask', 'trust', 'rainbow']
  },
  handleUri: async (uri) => {
    if (!isMobile) return false;

    // Detect installed wallet
    const hasMetaMask = typeof window !== 'undefined' && window.ethereum?.isMetaMask;
    const hasTrust = typeof window !== 'undefined' && window.ethereum?.isTrust;
    
    // Try direct injection first if available
    if (hasMetaMask || hasTrust) {
      try {
        await window.ethereum.request({ 
          method: 'wallet_addEthereumChain', 
          params: [{
            chainId: `0x${bscTestnet.id.toString(16)}`,
            chainName: bscTestnet.name,
            nativeCurrency: bscTestnet.nativeCurrency,
            rpcUrls: [bscTestnet.rpcUrls.default.http[0]],
            blockExplorerUrls: [bscTestnet.blockExplorers.default.url],
          }]
        });
        return true;
      } catch (e) {
        console.warn('Failed to add chain:', e);
      }
    }

    // Fallback to deep linking
    let deepLink;
    if (hasMetaMask) {
      deepLink = walletDeepLinks.metamask(uri);
    } else if (hasTrust) {
      deepLink = walletDeepLinks.trust(uri);
    } else {
      // If no wallet detected, try universal links
      deepLink = `https://metamask.app.link/wc?uri=${encodeURIComponent(uri)}`;
    }

    if (deepLink) {
      window.location.href = deepLink;
      return true;
    }

    return false;
  }
};

// Prioritize mobile-friendly wallets on mobile
const getWalletGroups = () => {
  if (isMobile) {
    return [
      {
        groupName: 'Popular',
        wallets: [
          metaMaskWallet,
          trustWallet,
          rainbowWallet,
          walletConnectWallet,
        ]
      },
      {
        groupName: 'More',
        wallets: [
          coinbaseWallet,
          argentWallet,
          omniWallet,
          injectedWallet,
        ]
      }
    ];
  }
  
  return [
    {
      groupName: 'Recommended',
      wallets: [
        metaMaskWallet,
        rainbowWallet,
        walletConnectWallet,
        trustWallet,
      ]
    },
    {
      groupName: 'Others',
      wallets: [
        coinbaseWallet,
        argentWallet,
        ledgerWallet,
        safeWallet,
        braveWallet,
        imTokenWallet,
        injectedWallet,
        omniWallet,
      ]
    }
  ];
};

const connectors = connectorsForWallets(getWalletGroups(), {
  projectId,
  appName: 'Tinseltoken',
  chains: [bscTestnet],
  initialChain: bscTestnet.id,
  walletConnectOptions: walletConnectConfig
});

// Handle deep linking redirects
if (typeof window !== 'undefined') {
  window.addEventListener('load', () => {
    const url = new URL(window.location.href);
    const wcUri = url.searchParams.get('wc');
    if (wcUri) {
      const uri = decodeURIComponent(wcUri);
      const hasMetaMask = window.ethereum?.isMetaMask;
      const hasTrust = window.ethereum?.isTrust;
      
      if (hasMetaMask) {
        window.location.href = walletDeepLinks.metamask(uri);
      } else if (hasTrust) {
        window.location.href = walletDeepLinks.trust(uri);
      }
    }
  });
}

export const config = createConfig({
  connectors,
  chains: [bscTestnet],
  transports: {
    [bscTestnet.id]: http(),
  },
});