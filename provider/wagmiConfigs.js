import {
  mainnet,
  polygon,
  optimism,
  arbitrum,
  base,
  bsc,
  bscTestnet,
  holesky,
  localhost,
  sepolia,
  baseSepolia,
} from "wagmi/chains";
import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { injected, metaMask, safe, walletConnect } from "wagmi/connectors";

const projectId = "c87b9758c721b75cf076ef3cc19ddd58"

// const projectId = process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID;

export const config = getDefaultConfig({
  appName: "Tinseltoken",
  projectId: projectId,
  chains: [bscTestnet],
  ssr: true,
});
