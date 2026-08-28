import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SentinelGraph | Anti-Money Laundering & Financial Crime Graph Intelligence",
  description:
    "Enterprise Graph Database Application backed by CognoDB (openCypher/Bolt) for detecting circular laundering rings, synthetic identities, mule layering, and sanction risks.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#0b0f19] text-slate-100 min-h-screen flex flex-col antialiased selection:bg-sky-500/30 selection:text-sky-200">
        {children}
      </body>
    </html>
  );
}
