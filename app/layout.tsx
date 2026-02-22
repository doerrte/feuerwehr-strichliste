import "./globals.css";
import Navbar from "@/components/Navbar";
import InstallPrompt from "@/components/InstallPrompt";

export const metadata = {
  title: "Strichliste",
  description: "Getränke Strichliste",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de">
      <head>
        <link rel="apple-touch-icon" href="/icons/feuerwehr.png" />
        <meta name="theme-color" content="#dc2626" />
      </head>
      <body className="min-h-screen bg-gray-100 pb-20">
        <InstallPrompt />
        {children}
        <Navbar />
      </body>
    </html>
  );
}
