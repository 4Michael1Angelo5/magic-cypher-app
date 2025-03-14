

import type { Metadata } from "next";
// import { Geist, Geist_Mono ,Azeret_Mono} from "next/font/google";
import "./globals.css";
import 'bootstrap/dist/css/bootstrap.min.css';

import { App } from "./app";
 
// const geistSans = Geist({
//   variable: "--font-geist-sans",
//   subsets: ["latin"],
//   display:"swap",
//   adjustFontFallback:false
// });

// const geistMono = Geist_Mono({
//   variable: "--font-geist-mono",
//   subsets: ["latin"],
//   display:"swap",
//   adjustFontFallback:false
// });

export const metadata: Metadata = {
  title: "Magic Cypher",
  description: "Securly Encrypt and Decrypt any text message",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en"  suppressHydrationWarning>
      {/* <body className={`${geistSans.variable} ${geistMono.variable}`}> */}
      <body>
         <App>{children}</App>
      </body>
    </html>
  );
}
