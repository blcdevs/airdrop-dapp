import { ConnectButton } from "@rainbow-me/rainbowkit";

export const CustomConnectButton = () => {
  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openChainModal,
        openConnectModal,
        mounted,
      }) => {
        const ready = mounted;
        const connected = ready && account && chain;

        return (
          <div
            {...(!ready && {
              "aria-hidden": true,
              style: {
                opacity: 0,
                pointerEvents: "none",
                userSelect: "none",
              },
            })}
          >
            {(() => {
              if (!connected) {
                return (
                  <button
                    onClick={() => {
                      if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
                        setTimeout(openConnectModal, 100);
                        
                        if (window.ethereum) {
                          if (window.ethereum.isMetaMask) {
                            window.ethereum.request({ method: 'wallet_requestPermissions', params: [{ eth_accounts: {} }] });
                          } else if (window.ethereum.isTrust) {
                            window.location.href = `trust://`;
                          }
                        }
                      } else {
                        openConnectModal();
                      }
                    }}
                    className="bg-[#E0AD6B] hover:bg-[#eba447] text-white px-8 py-3 rounded-lg text-lg font-semibold transition-all duration-200 transform hover:scale-105"
                  >
                    Connect Wallet
                  </button>
                );
              }

              if (chain.unsupported) {
                return (
                  <button
                    onClick={openChainModal}
                    className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg"
                  >
                    Wrong network
                  </button>
                );
              }

              return (
                <div className="flex items-center gap-4">
                  <button
                    onClick={openChainModal}
                    className="bg-[#E0AD6B] hover:bg-[#d8953d] text-[#1A1A1A] px-4 py-2 rounded-lg flex items-center gap-2 mr-2"
                  >
                    {chain.hasIcon && (
                      <div className="w-5 h-5 ">
                        {chain.iconUrl && (
                          <img
                            alt={chain.name ?? "Chain icon"}
                            src={chain.iconUrl}
                            className="w-5 h-5"
                          />
                        )}
                      </div>
                    )}
                  </button>

                  <button
                    onClick={openAccountModal}
                    className="bg-[#E0AD6B] hover:bg-[#d8953d] text-[#1A1A1A] px-4 py-2 rounded-lg flex items-center gap-2"
                  >
                    {account.displayName}
                    {account.displayBalance && ` (${account.displayBalance})`}
                  </button>
                </div>
              );
            })()}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
};