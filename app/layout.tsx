import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Feuerwehr Getränkeliste",
  description: "Strichliste",
  manifest: "/manifest.json",
  icons: {
    apple: "/icons/feuerwehr.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de">
      <body className="min-h-screen bg-gray-100 dark:bg-gray-950 text-gray-900 dark:text-gray-100">
        {children}
      </body>
    </html>
  );
}