import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
import Image from "next/image";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { SuppressErrors } from "./suppress-errors";

export const metadata: Metadata = {
  title: "Driver Performance Evaluation - FHE",
  description: "Encrypted Driver Performance Evaluation System using FHEVM",
  icons: {
    icon: "/logo.svg",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                if (typeof window === 'undefined') return;
                
                const originalError = console.error;
                const originalWarn = console.warn;
                const originalLog = console.log;
                
                function shouldSuppress(message) {
                  if (!message) return false;
                  const msg = String(message).toLowerCase();
                  
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
                
                console.error = function(...args) {
                  try {
                    const message = args[0];
                    if (shouldSuppress(message) || shouldSuppress(args.join(" "))) {
                      return;
                    }
                  } catch (e) {}
                  originalError.apply(console, args);
                };
                
                console.warn = function(...args) {
                  try {
                    const message = args[0];
                    if (shouldSuppress(message) || shouldSuppress(args.join(" "))) {
                      return;
                    }
                  } catch (e) {}
                  originalWarn.apply(console, args);
                };
                
                // Suppress unhandled promise rejections
                window.addEventListener('unhandledrejection', function(event) {
                  try {
                    const reason = event.reason;
                    const message = reason?.message || reason?.toString() || String(reason || "");
                    if (shouldSuppress(message)) {
                      event.preventDefault();
                      event.stopPropagation();
                      return false;
                    }
                  } catch (e) {}
                }, true);
                
                // Suppress global errors
                window.addEventListener('error', function(event) {
                  try {
                    const message = event.message || event.filename || "";
                    if (shouldSuppress(message)) {
                      event.preventDefault();
                      event.stopPropagation();
                      return false;
                    }
                  } catch (e) {}
                }, true);
              })();
            `,
          }}
        />
      </head>
      <body className={`driver-bg text-foreground antialiased`}>
        <SuppressErrors />
        <div className="fixed inset-0 w-full h-full driver-bg z-[-20] min-w-[850px]"></div>
        <main className="flex flex-col max-w-screen-lg mx-auto pb-20 min-w-[850px]">
          <nav className="flex w-full px-3 md:px-0 h-fit py-10 justify-between items-center">
            <Image
              src="/logo.svg"
              alt="Driver Performance Logo"
              width={120}
              height={120}
            />
          </nav>
          <ErrorBoundary>
            <Providers>{children}</Providers>
          </ErrorBoundary>
        </main>
      </body>
    </html>
  );
}

