import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Feuerwehr Getränkeliste",
  description: "Strichliste",
  manifest: "/manifest.json",
  icons: {
    icon: "/icons/feuerwehr.png",
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
      <body className="min-h-screen bg-gray-50 text-gray-900 dark:bg-[#0B1220] dark:text-gray-100 transition-colors duration-300">
        {children}
      </body>
    </html>
  );
}