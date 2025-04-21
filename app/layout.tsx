import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Dropshipping Ürün Değerlendirme",
  description: "Shopify dropshipping ürünlerini değerlendirin ve saklayın",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body className={`${inter.className} bg-gray-50`}>{children}</body>
    </html>
  );
}
