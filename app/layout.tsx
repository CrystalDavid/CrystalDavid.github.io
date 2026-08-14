import type { Metadata, Viewport } from "next";
import "./globals.css";

const fontBootstrapScript = String.raw`
  try {
    var root = document.documentElement;
    root.classList.add("fonts-loading");

    var language = localStorage.getItem("david-site-language-v2") === "zh" ? "zh" : "en";
    root.dataset.lang = language;
    root.lang = language === "zh" ? "zh-CN" : "en";

    var fontParameter = new URLSearchParams(location.search).get("font");
    var storedFont = sessionStorage.getItem("david-site-font-v1");
    var fontVersion = fontParameter === "mi" || fontParameter === "harmony"
      ? fontParameter
      : storedFont === "mi" || storedFont === "harmony"
        ? storedFont
        : "mi";

    root.dataset.font = fontVersion;
    if (fontVersion === "harmony") {
      root.classList.remove("fonts-loading");
    }
    if (fontParameter === "mi" || fontParameter === "harmony") {
      sessionStorage.setItem("david-site-font-v1", fontVersion);
    }

    var fontFiles = fontVersion === "mi"
      ? [{ href: "/fonts/misans-site.woff2", type: "font/woff2" }]
      : [{ href: "/fonts/harmonyos-sans-sc-regular.ttf", type: "font/ttf" }];

    fontFiles.forEach(function (fontFile) {
      var preload = document.createElement("link");
      preload.rel = "preload";
      preload.as = "font";
      preload.type = fontFile.type;
      preload.crossOrigin = "anonymous";
      preload.href = fontFile.href;
      document.head.appendChild(preload);
    });

    var reveal = function () {
      root.classList.remove("fonts-loading");
      root.classList.add("fonts-ready");
    };
    var fallback = setTimeout(reveal, 30000);

    addEventListener("DOMContentLoaded", function () {
      if (!document.fonts) {
        clearTimeout(fallback);
        reveal();
        return;
      }

      var cjkFamily = fontVersion === "mi" ? "MiSans VF" : "HarmonyOS Sans SC";
      Promise.all([
        document.fonts.load('400 1em Nunito'),
        document.fonts.load('700 1em Nunito'),
        document.fonts.load('400 1em "' + cjkFamily + '"', '中文字体测试'),
        document.fonts.load('500 1em "' + cjkFamily + '"', '中文字体测试'),
        document.fonts.load('700 1em "' + cjkFamily + '"', '中文字体测试')
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
    <html lang="en" data-lang="en" data-font="mi">
      <head>
        <link
          rel="preload"
          href="/fonts/nunito-latin.woff2"
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
