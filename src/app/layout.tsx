import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
// import PlausibleProvider from 'next-plausible'

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Pokemon Card Higher Lower Game",
  description: "Test your Pokemon card knowledge!",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="favicon.png" type="image/png" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, viewport-fit=cover"
        />
      </head>
      <body
        className={inter.className}
        style={{ backgroundColor: "transparent" }}
      >
        {children}
        <Analytics />
      </body>
    </html>
  );
}
