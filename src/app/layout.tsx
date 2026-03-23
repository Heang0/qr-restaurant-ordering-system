import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { ToastProvider } from "@/contexts/ToastContext";

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "OrderHey! - QR Restaurant Ordering System",
  description: "Elevate Your Restaurant Experience with QR Menus. Seamless ordering, cost efficiency, and real-time updates.",
  keywords: ["QR menu", "restaurant", "ordering", "digital menu", "Khmer", "Cambodia"],
  authors: [{ name: "OrderHey Team" }],
  creator: "OrderHey",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://www.orderhey.online",
    title: "OrderHey! - QR Restaurant Ordering System",
    description: "Elevate Your Restaurant Experience with QR Menus",
    siteName: "OrderHey",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#e74c3c",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body className={`${inter.variable} font-sans antialiased`}>
        <AuthProvider>
          <LanguageProvider>
            <ToastProvider>
              {children}
            </ToastProvider>
          </LanguageProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
