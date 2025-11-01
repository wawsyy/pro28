"use client";

import { useEffect } from "react";

function shouldSuppress(message: string): boolean {
  if (!message) return false;
  const msg = message.toLowerCase();
  
  return (
    msg.includes("base account sdk") ||
    msg.includes("cross-origin-opener-policy") ||
    msg.includes("failed to fetch") ||
    msg.includes("err_blocked_by_response") ||
    msg.includes("notsameoriginafterdefaultedtosameoriginbycoep") ||
    msg.includes("api.web3modal.org") ||
    msg.includes("pulse.walletconnect") ||
    msg.includes("cca-lite.coinbase.com") ||
    msg.includes("web3modal.org") ||
    msg.includes("reown config") ||
    msg.includes("failed to fetch remote project configuration") ||
    msg.includes("analytics sdk") ||
    msg.includes("http status code: 403") ||
    msg.includes("http status code: 400")
  );
}

export function SuppressErrors() {
  useEffect(() => {
    const originalError = console.error;
    const originalWarn = console.warn;

    console.error = (...args: unknown[]) => {
      try {
        const message = args[0]?.toString() || "";
        const fullMessage = args.map(a => String(a || "")).join(" ");
        if (shouldSuppress(message) || shouldSuppress(fullMessage)) {
          return;
        }
      } catch (e) {
        // Ignore errors in suppression logic
      }
      originalError.apply(console, args);
    };

    console.warn = (...args: unknown[]) => {
      try {
        const message = args[0]?.toString() || "";
        const fullMessage = args.map(a => String(a || "")).join(" ");
        if (shouldSuppress(message) || shouldSuppress(fullMessage)) {
          return;
        }
      } catch (e) {
        // Ignore errors in suppression logic
      }
      originalWarn.apply(console, args);
    };

    const handleError = (event: ErrorEvent) => {
      try {
        const message = event.message || event.filename || "";
        if (shouldSuppress(message)) {
          event.preventDefault();
          event.stopPropagation();
          return false;
        }
      } catch (e) {
        // Ignore errors in suppression logic
      }
    };

    const handleRejection = (event: PromiseRejectionEvent) => {
      try {
        const reason = event.reason;
        const message = reason?.message || reason?.toString() || String(reason || "");
        if (shouldSuppress(message)) {
          event.preventDefault();
          event.stopPropagation();
          return false;
        }
      } catch (e) {
        // Ignore errors in suppression logic
      }
    };

    window.addEventListener("error", handleError, true);
    window.addEventListener("unhandledrejection", handleRejection, true);

    return () => {
      console.error = originalError;
      console.warn = originalWarn;
      window.removeEventListener("error", handleError, true);
      window.removeEventListener("unhandledrejection", handleRejection, true);
    };
  }, []);

  return null;
}

