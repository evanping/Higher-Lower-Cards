import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://higherlowercards.vercel.app"),
  title: "Higher or Lower Pokemon Cards",
  description: "A guessing game where players can test their Pokemon card knowledge!",
  keywords: ["pokemon cards", "card values", "guessing game", "higher lower", "pokemon tcg", "card prices", "pokemon game", "trading cards"],
  
  // Open Graph metadata for social sharing
  openGraph: {
    title: "Higher or Lower Pokemon Cards",
    description: "A guessing game where players can test their Pokemon card knowledge!",
    url: "https://higherlowercards.vercel.app",
    images: [
      {
        url: "og-image.png",
        width: 1415,
        height: 1415,
        alt: "Pokemon Card Higher Lower Game Screenshot",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.png" type="image/png" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, viewport-fit=cover"
        />
        <meta name="description" content="Test your knowledge of Pokémon card values with this higher or lower guessing game!"/>
        
        {/* Structured Data for Google */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Game",
              "name": "Pokemon Card Higher Lower Game",
              "description": "A guessing game where players can test their Pokemon card knowledge.",
              "url": "https://higherlowercards.vercel.app",
              "image": "https://higherlowercards.vercel.app/og-image.png",
              "genre": ["Card Game", "Guessing Game", "Educational Game"],
              "gamePlatform": "Web Browser",
              "operatingSystem": "Any",
              "applicationCategory": "Game",
            })
          }}
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