import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";

import { CustomConnectButton } from "./ConnectButton";
import CountdownTimer from "./CountdownTimer/CountdownTimer";
import AirdropBanner from "./AirdropBanner/AirdropBanner";
import UserDetailsModal from "./UserDetailsModal/UserDetailsModal";

const AirDrop = ({
  airdropInfo,
  setReferralAddress,
  handleParticipate,
  handleParticipateWithoutReferral,
  account,
  activeUser,
}) => {
  const router = useRouter();
  const [isReferral, setIsReferral] = useState(false);
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
  return (
    <section
      id="token"
      className="section_token blue_light_bg"
      data-z-index={1}
      data-parallax="scroll"
      data-image-src="assets/images/token_bg.png"
    >
      <div className="container">
        <div className="row">
          <div className="col-lg-6 offset-lg-3 col-md-12 col-sm-12">
            <div className="title_default_light title_border text-center">
              <h4
                className="animation"
                data-animation="fadeInUp"
                data-animation-delay="0.2s"
              >
                Token Sale
              </h4>
              <p
                className="animation"
                data-animation="fadeInUp"
                data-animation-delay="0.4s"
              >
                Join the industry leaders to discuss where the markets are
                heading. We accept token payments.
              </p>
            </div>
          </div>
        </div>
        <div className="row">
          <div className="col-lg-8 offset-lg-2">
            <div className="token_sale">
              <div
                className="tk_countdown text-center animation token_countdown_bg"
                data-animation="fadeIn"
                data-animation-delay="1s"
              >
                <div className="tk_counter_inner">
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
                          AirDrop
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
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="row">
          <div className="col-lg-8 offset-lg-2">
            <div className="row">
              <div className="col-lg-4 col-md-6 col-sm-6 col-xs-12 pl-2 pr-2">
                <div className="pr_box">
                  <h6
                    className="animation"
                    data-animation="fadeInUp"
                    data-animation-delay="0.2s"
                  >
                    Starting time :
                  </h6>
                  <p
                    className="animation"
                    data-animation="fadeInUp"
                    data-animation-delay="0.4s"
                  >
                    Apr 23, 2018 (Mon 10:00 AM)
                  </p>
                </div>
              </div>
              <div className="col-lg-4 col-md-6 col-sm-6 col-xs-12 pl-2 pr-2">
                <div className="pr_box">
                  <h6
                    className="animation"
                    data-animation="fadeInUp"
                    data-animation-delay="0.6s"
                  >
                    Ending time :
                  </h6>
                  <p
                    className="animation"
                    data-animation="fadeInUp"
                    data-animation-delay="0.8s"
                  >
                    Jun 18, 2018 (Mon 12:00 PM)
                  </p>
                </div>
              </div>
              <div className="col-lg-4 col-md-6 col-sm-6 col-xs-12 pl-2 pr-2">
                <div className="pr_box">
                  <h6
                    className="animation"
                    data-animation="fadeInUp"
                    data-animation-delay="1s"
                  >
                    Tokens exchange rate
                  </h6>
                  <p
                    className="animation"
                    data-animation="fadeInUp"
                    data-animation-delay="1.2s"
                  >
                    1 ETH = 820 BCC, 1 BTC = 2150 BCC
                  </p>
                </div>
              </div>
              <div className="col-lg-4 col-md-6 col-sm-6 col-xs-12 pl-2 pr-2">
                <div className="pr_box">
                  <h6
                    className="animation"
                    data-animation="fadeInUp"
                    data-animation-delay="0.2s"
                  >
                    Low - High 24h :
                  </h6>
                  <p
                    className="animation"
                    data-animation="fadeInUp"
                    data-animation-delay="0.4s"
                  >
                    $ 6,455.83 - $ 7,071.42
                  </p>
                </div>
              </div>
              <div className="col-lg-4 col-md-6 col-sm-6 col-xs-12 pl-2 pr-2">
                <div className="pr_box">
                  <h6
                    className="animation"
                    data-animation="fadeInUp"
                    data-animation-delay="0.6s"
                  >
                    Total tokens sale
                  </h6>
                  <p
                    className="animation"
                    data-animation="fadeInUp"
                    data-animation-delay="0.8s"
                  >
                    850,000 BCC (8%)
                  </p>
                </div>
              </div>
              <div className="col-lg-4 col-md-6 col-sm-6 col-xs-12 pl-2 pr-2">
                <div className="pr_box">
                  <h6
                    className="animation"
                    data-animation="fadeInUp"
                    data-animation-delay="1s"
                  >
                    Acceptable Currency :
                  </h6>
                  <p
                    className="animation"
                    data-animation="fadeInUp"
                    data-animation-delay="1.2s"
                  >
                    BTC, Eth, Ltc, XRP
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AirDrop;
