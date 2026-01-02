import type { Metadata } from "next";
import "./globals.css";

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
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
