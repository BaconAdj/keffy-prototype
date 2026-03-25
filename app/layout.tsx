import { ClerkProvider } from '@clerk/nextjs'
import { ItineraryProvider } from '@/context/ItineraryContext'
import type { Metadata } from "next";
import Script from 'next/script';
import "./globals.css";

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: "Keffy - Your Personal Travel Concierge",
  description: "AI-powered travel planning that feels personal",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body>
          <ItineraryProvider>
            {children}
          </ItineraryProvider>

          <Script
            id="travelpayouts-verification"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                (function () {
                    var script = document.createElement("script");
                    script.async = 1;
                    script.src = 'https://emrldtp.cc/NDkwODg3.js?t=490887';
                    document.head.appendChild(script);
                })();
              `
            }}
          />
        </body>
      </html>
    </ClerkProvider>
  );
}
