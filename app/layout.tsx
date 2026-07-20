import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://crystaldavid.github.io"),
  title: {
    default: "David — Independent Developer",
    template: "%s",
  },
  description: "David builds AI agents, products and research.",
  authors: [{ name: "David" }],
  creator: "David",
  openGraph: {
    title: "David — Independent Developer",
    description: "AI agents, products and research.",
    type: "website",
    locale: "en_US",
    images: [
      {
        url: "/og.png",
        width: 1731,
        height: 909,
        alt: "David — Independent Developer",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "David — Independent Developer",
    description: "AI agents, products and research.",
    images: ["/og.png"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#ffffff",
  colorScheme: "light",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-lang="en">
      <head>
        <link
          rel="preload"
          href="/fonts/nunito-latin.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
