import React from "react";
import Script from "next/script";

type GoogleAdSenseAutoAdsProps = {
  publisherId: string;
};

export function GoogleAdSenseAutoAds({
  publisherId,
}: GoogleAdSenseAutoAdsProps) {
  return (
    <>
      <span
        hidden
        data-testid="adsense-auto-ads"
        data-publisher-id={publisherId}
        data-script-src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"
      />
      <Script
        id="adsense-auto-ads"
        async
        src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${publisherId}`}
        crossOrigin="anonymous"
        strategy="afterInteractive"
      />
    </>
  );
}
