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

const projectId = process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID;

export const config = getDefaultConfig({
  appName: "Airdrop",
  projectId: projectId,
  chains: [bscTestnet],
  ssr: true,
});
