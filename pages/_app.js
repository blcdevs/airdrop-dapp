// pages/_app.js

import "@rainbow-me/rainbowkit/styles.css";
import { Web3Provider } from "../context/Web3Context";
import { NotificationProvider } from "../context/NotificationContext";
import "../styles/globals.css";
import Head from 'next/head'; // Add this import

import { config } from "../provider/wagmiConfigs";
import Header from "../components/Header";

import { RainbowKitProvider, darkTheme } from "@rainbow-me/rainbowkit";
import { WagmiProvider } from "wagmi";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";

const queryClient = new QueryClient();

function MyApp({ Component, pageProps }) {
  return (
    <>
    <Head>
        <link rel="icon" href="/logo.png" />
        <link rel="shortcut icon" href="/logo.png" />
      </Head>

      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          <RainbowKitProvider
            theme={darkTheme({
              accentColor: "#E0AD6B",
              accentColorForeground: "white",
              borderRadius: "small",
              fontStack: "system",
              overlayBlur: "small",
            })}
          >
            <Web3Provider>
              <NotificationProvider>
                <div className="min-h-screen bg-[#1A1A1A]">
                  {/* <MainHeader /> */}
                  <Component {...pageProps} />
                </div>
              </NotificationProvider>
            </Web3Provider>
          </RainbowKitProvider>
        </QueryClientProvider>
      </WagmiProvider>
      <script src="assets/js/jquery-1.12.4.min.js"></script>
      <script src="assets/bootstrap/js/bootstrap.min.js"></script>
      <script src="assets/owlcarousel/js/owl.carousel.min.js"></script>
      <script src="assets/js/magnific-popup.min.js"></script>
      <script src="assets/js/waypoints.min.js"></script>
      <script src="assets/js/parallax.js"></script>
      <script src="assets/js/particles.min.js"></script>
      <script src="assets/js/jquery.dd.min.js"></script>
      <script src="assets/js/jquery.counterup.min.js"></script>
      <script src="assets/js/spop.min.js"></script>
      <script src="assets/js/notification.js"></script>

      <script src="assets/js/scripts.js"></script>
    </>
  );
}

export default MyApp;
