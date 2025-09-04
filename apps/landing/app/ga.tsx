"use client";

import Script from "next/script";

export default function GA({ id }: { id: string }) {
  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${id}`}
        strategy="afterInteractive"
      />
      <Script id="ga-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());

          // Consent defaults: deny analytics until user accepts
          gtag('consent', 'default', {
            ad_storage: 'denied',
            ad_user_data: 'denied',
            ad_personalization: 'denied',
            analytics_storage: 'denied'
          });

          // GA config (safe with denied; no cookies until consent granted)
          gtag('config', '${id}', {
            anonymize_ip: true
          });
        `}
      </Script>
    </>
  );
}
