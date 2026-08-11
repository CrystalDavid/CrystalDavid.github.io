import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://crystaldavid.github.io"),
  title: { default: "David — Independent Developer", template: "%s" },
  description: "David builds AI agents, products and research.",
  authors: [{ name: "David" }],
  creator: "David",
  openGraph: {
    title: "David — Independent Developer",
    description: "AI agents, products and research.",
    type: "website",
    locale: "en_US",
    images: [{ url: "/og.png", width: 1731, height: 909, alt: "David — Independent Developer" }],
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
  maximumScale: 2,
  themeColor: "#ffffff",
  colorScheme: "light",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
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
        <link
          rel="preload"
          href="/fonts/david-yuan-round-400.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/fonts/david-yuan-round-500.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/fonts/david-yuan-round-700.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <script
          dangerouslySetInnerHTML={{
            __html:
              "try{var r=document.documentElement;r.classList.add('fonts-loading');var l=localStorage.getItem('david-site-language-v2')==='zh'?'zh':'en';r.dataset.lang=l;r.lang=l==='zh'?'zh-CN':'en';var d=function(){r.classList.remove('fonts-loading');r.classList.add('fonts-ready')};var t=setTimeout(d,3000);addEventListener('DOMContentLoaded',function(){if(!document.fonts){clearTimeout(t);d();return}Promise.all([document.fonts.load('400 1em Nunito'),document.fonts.load('700 1em Nunito'),document.fonts.load('400 1em \\\"David Yuan Round Web\\\"'),document.fonts.load('500 1em \\\"David Yuan Round Web\\\"'),document.fonts.load('700 1em \\\"David Yuan Round Web\\\"')]).then(function(){return document.fonts.ready}).then(function(){clearTimeout(t);d()},function(){clearTimeout(t);d()})})}catch(e){document.documentElement.classList.remove('fonts-loading')}",
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
