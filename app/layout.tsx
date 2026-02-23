import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Feuerwehr Getränke",
  description: "Strichlisten App",
};

export const viewport = {
  themeColor: "#000000",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de">
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body>{children}</body>
    </html>
  );
}