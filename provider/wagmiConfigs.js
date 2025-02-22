import { createConfig, http } from 'wagmi';
import { bsc } from 'wagmi/chains';
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
    mobileWallets: true
  }
};

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
    chains: [bsc],
    initialChain: bsc.id,
    walletConnectOptions: walletConnectConfig,
    mobileWalletConfig: {
      enableMobileWalletConnect: true,
      handleUri: (uri) => {
        if (typeof window !== 'undefined') {
          // For MetaMask
          if (window.ethereum?.isMetaMask) {
            window.ethereum.request({ 
              method: 'wallet_addEthereumChain', 
              params: [{
                chainId: `0x${bsc.id.toString(16)}`,
                chainName: bsc.name,
                nativeCurrency: bsc.nativeCurrency,
                rpcUrls: [bsc.rpcUrls.default.http[0]],
                blockExplorerUrls: [bsc.blockExplorers.default.url],
              }]
            });
          }
          
          // For Trust Wallet
          if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
            const encoded = encodeURIComponent(uri);
            window.location.href = `https://link.trustwallet.com/wc?uri=${encoded}`;
            return true;
          }
        }
        return false;
      }
    }
  }
);

if (typeof window !== 'undefined') {
  window.addEventListener('load', () => {
    if (window.location.href.includes('wc?uri=')) {
      const uri = decodeURIComponent(window.location.href.split('wc?uri=')[1]);
      window.location.href = `trust://wc?uri=${uri}`;
    }
  });
}

export const config = createConfig({
  connectors,
  chains: [bsc],
  transports: {
    [bsc.id]: http(),
  },
});