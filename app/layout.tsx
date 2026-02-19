import "./globals.css";
import Navbar from "@/components/Navbar";

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
      <body className="min-h-screen bg-gray-100 pb-20">
        {children}
        <Navbar />
      </body>
    </html>
  );
}
