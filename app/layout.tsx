import type { Metadata, Viewport } from "next";
import "./globals.css";

const fontBootstrapScript = String.raw`
  try {
    var root = document.documentElement;
    root.classList.add("fonts-loading");
    root.dataset.font = "noto";
    if (/^#article-card-/.test(location.hash)) {
      root.classList.add("article-anchor-return");
    }

    var language = localStorage.getItem("david-site-language-v2") === "zh" ? "zh" : "en";
    root.dataset.lang = language;
    root.lang = language === "zh" ? "zh-CN" : "en";

    var reveal = function () {
      root.classList.remove("fonts-loading");
      root.classList.add("fonts-ready");
    };
    var fallback = setTimeout(reveal, 8000);

    addEventListener("DOMContentLoaded", function () {
      if (!document.fonts) {
        clearTimeout(fallback);
        reveal();
        return;
      }

      Promise.all([
        document.fonts.load('400 1em Nunito'),
        document.fonts.load('700 1em Nunito'),
        document.fonts.load('400 1em "Noto Sans SC"', '中文字体测试'),
        document.fonts.load('600 1em "Noto Sans SC"', '中文字体测试')
      ]).then(function () {
        return document.fonts.ready;
      }).then(function () {
        clearTimeout(fallback);
        reveal();
      }, function () {
        clearTimeout(fallback);
        reveal();
      });
    });
  } catch (error) {
    document.documentElement.classList.remove("fonts-loading");
  }
`;

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
    <html lang="en" data-lang="en" data-font="noto">
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
          href="/fonts/noto-sans-sc-site.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: fontBootstrapScript,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
