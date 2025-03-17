

import type { Metadata } from "next"; 
import "./globals.css";
import 'bootstrap/dist/css/bootstrap.min.css';

import { App } from "./app";
 
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
    <html lang="en"  suppressHydrationWarning={true} >
      <body>
         <App>{children}</App>
      </body>
    </html>
  );
}
