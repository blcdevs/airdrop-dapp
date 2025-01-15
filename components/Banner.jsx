import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from 'next/link'; 

import { CustomConnectButton } from "./ConnectButton";
import CountdownTimer from "./CountdownTimer/CountdownTimer";
import AirdropBanner from "./AirdropBanner/AirdropBanner";
import UserDetailsModal from "./UserDetailsModal/UserDetailsModal";

const ADMIN = process.env.NEXT_PUBLIC_ADMIN_ADDRESS;

const Banner = ({
  airdropInfo,
  handleParticipate,
  handleParticipateWithoutReferral,
  activeUser,
  setReferralAddress,
  account,
  setIsAdminModalOpen,
}) => {
  const router = useRouter();
  const [isReferral, setIsReferral] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    // Check if we're in the browser and URL contains ref parameter
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      const path = url.pathname + url.search;
      const refMatch = path.match(/ref\/?(0x[a-fA-F0-9]{40})/);

      if (refMatch) {
        setIsReferral(true);
        setReferralAddress(refMatch[1]);
      }
    }
  }, [router.query]);

  console.log(airdropInfo);
  return (
    <>
      <section
        id="home_section"
        className="section_banner banner_bg1 banner_shape body-background"
      >
        <div className="banner_rouded_bg blue_light_bg" />
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-6 col-md-12 col-sm-12 order-lg-first">
              <div className="banner_text text_md_center">
                <h1
                  className="animation"
                  data-animation="fadeInUp"
                  data-animation-delay="1.1s"
                >
                  Tinseltoken (TNTC): Revolutionizing Blockchain Accessibility
                </h1>
                <p
                  className="animation"
                  data-animation="fadeInUp"
                  data-animation-delay="1.3s"
                >
                  Tinseltoken (TNTC) is offering a massive airdrop of 140 million tokens (70% of total supply). 
                  Distribute in December 2024, this airdrop aims to democratize blockchain access and foster global community engagement.
                   Claim your free TNTC tokens through our simple 3-step process!
                </p>
                <div
                  className="btn_group animation"
                  data-animation="fadeInUp"
                  data-animation-delay="1.4s"
                >
                  <a
                    target="_blank"
                    href="assets/images/roadmap.pdf"
                    className="btn btn-default btn-radius "
                  >
                    Whitepaper
                  </a>

                 

               {/* {account && (
                   <Link href="/dashboard" className="btn btn-default btn-radius">
                   Profile / Tasks
                 </Link>
                  )} */}
              

                  {account && (
                    <button
                      onClick={() => setIsModalOpen(true)}
                      className="btn btn-default btn-radius"
                    >
                      Referral
                    </button>
                  )}

                </div>
              </div>
            </div>
            <div className="col-lg-5 offset-lg-1 col-md-12 col-sm-12 order-first">
              <div className="banner_inner res_md_mb_50 res_xs_mb_30">
                <h6
                  className="animation alert alert-warning text-uppercase"
                  data-animation="fadeInUp"
                  data-animation-delay="1s"
                >
                  {airdropInfo?.tokenSymbol} AIRDROP ONGOING...
                </h6>
                <div
                  className="tk_countdown text-center animation bg-white"
                  data-animation="fadeIn"
                  data-animation-delay="1.1s"
                >
                  <div className="banner_text tk_counter_inner">
                    <CountdownTimer airdropInfo={airdropInfo} />

                    <AirdropBanner airdropInfo={airdropInfo} />
                    {!account ? (
                      <CustomConnectButton />
                    ) : (
                      <>
                        {isReferral && !activeUser?.hasParticipated ? (
                          <button
                            className="btn btn-default btn-radius animation"
                            data-animation="fadeInUp"
                            data-animation-delay="1.40s"
                            onClick={() => handleParticipate()}
                          >
                             AirDrop 
                          </button>
                        ) : !activeUser?.hasParticipated ? (
                          <button
                            className="btn btn-default btn-radius animation"
                            data-animation="fadeInUp"
                            data-animation-delay="1.40s"
                            onClick={() => handleParticipateWithoutReferral()}
                          >
                            Claim AirDrop
                          </button>
                        ) : (
                          <button
                            className="btn btn-default btn-radius animation"
                            data-animation="fadeInUp"
                            data-animation-delay="1.40s"
                          >
                            AirDrop Claimed Successfully
                          </button>
                        )}

                         {/* Dashboard button - only show if not admin */}
            {account?.toLowerCase() !== ADMIN?.toLowerCase() && (
              <Link href="/dashboard" className="btn btn-default btn-radius animation"
                data-animation="fadeInUp"
                data-animation-delay="1.45s">
                Go to Dashboard
              </Link>
            )}
                      </>
                    )}

                    

                    {ADMIN?.toLowerCase() == account?.toLowerCase() && (
                      <button onClick={() => setIsAdminModalOpen(true)}>
                        Only Admin
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <UserDetailsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        airdropInfo={airdropInfo}
        activeUser={activeUser}
        account={account}
      />
    </>
  );
};

export default Banner;
