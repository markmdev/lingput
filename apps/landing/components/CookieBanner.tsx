/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useRef, useState } from "react";

const STORAGE_KEY = "cookie-consent:v1";

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);
  const mounted = useRef(false);

  useEffect(() => {
    if (mounted.current) return;
    mounted.current = true;
    try {
      const hasChoice = localStorage.getItem(STORAGE_KEY) !== null;
      if (!hasChoice) setVisible(true);
    } catch {
      setVisible(true);
    }

    (window as any).showCookieBanner = () => setVisible(true);
  }, []);

  const updateConsent = (granted: boolean) => {
    const state = granted ? "granted" : "denied";
    const call = () => {
      if (typeof (window as any).gtag !== "function") return false;
      (window as any).gtag("consent", "update", {
        ad_storage: "denied",
        ad_user_data: "denied",
        ad_personalization: "denied",
        analytics_storage: state,
        functionality_storage: "granted",
        security_storage: "granted",
      });
      return true;
    };
    if (!call()) {
      let tries = 0;
      const t = setInterval(() => {
        tries++;
        if (call() || tries > 32) clearInterval(t);
      }, 250);
    }
  };

  const choose = (val: "accept" | "reject") => {
    try {
      localStorage.setItem(STORAGE_KEY, val);
    } catch {
      console.log("error");
    }
    updateConsent(val === "accept");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      role="region"
      aria-label="Cookie notice"
      className="fixed left-1/2 -translate-x-1/2 bottom-4 z-50 w-[min(720px,calc(100%-1.5rem))] rounded-xl border border-border bg-secondary text-secondary-foreground shadow-xl"
    >
      <div className="flex flex-col gap-3 p-3">
        <p className="text-sm leading-snug">
          We use cookies for <strong>analytics</strong> only. Ads & personalization are off by
          default. Choose <em>Accept</em> to enable analytics or <em>Reject</em> to continue with
          essentials. See our{" "}
          <a href="/privacy" className="underline">
            Privacy Policy
          </a>
          .
        </p>
        <div className="flex justify-end gap-2">
          <button
            onClick={() => choose("reject")}
            className="inline-flex items-center rounded-md border border-border px-3 py-1.5 text-sm font-medium hover:bg-muted"
          >
            Reject
          </button>
          <button
            onClick={() => choose("accept")}
            className="inline-flex items-center rounded-md bg-primary px-3 py-1.5 text-sm font-semibold text-primary-foreground hover:opacity-95"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
