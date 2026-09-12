import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";

export const metadata: Metadata = {
  title: "UTM Link Studio | 免費 GA4 UTM 網址產生器、短網址與 QR Code 生成工具",
  description: "專為數位行銷人、廣告主設計的 UTM 網址產生器。支援一鍵帶入 FB/IG/LINE 範本、縮短網址、生成高解析度 QR Code 以及 CSV 批量網址生成，完美相容 GA4 分析系統。",
  keywords: ["UTM產生器", "UTM Builder", "GA4", "數位行銷", "追蹤網址", "短網址產生器", "QR Code 產生器", "批量UTM"],
  authors: [{ name: "UTM Link Studio Team" }],
  openGraph: {
    title: "UTM Link Studio | 免費 GA4 UTM 網址產生器與批量工具",
    description: "極簡、精準的行銷網址建構工具，支援短網址、QR Code 與 CSV 批量生成，提升你的 GA4 數據追蹤效率！",
    url: "https://utm-link-studio.onrender.com",
    siteName: "UTM Link Studio",
    locale: "zh_TW",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "UTM Link Studio | 免費 GA4 UTM 網址產生器",
    description: "極簡、精準的行銷網址建構工具，支援短網址、QR Code 與 CSV 批量生成。",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const GA_MEASUREMENT_ID = "G-56C16B1PBH";

  return (
    <html lang="zh-TW">
      <head>
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_MEASUREMENT_ID}');
          `}
        </Script>
      </head>
      <body>{children}</body>
    </html>
  );
}
