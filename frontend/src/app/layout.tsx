import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AppRouteLoader } from "@/components/ui/AppRouteLoader";
import { AppToast } from "@/components/ui/AppToast";
import { ThemedDatePicker } from "@/components/ui/ThemedDatePicker";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Guhaya Sourcing",
  description: "Sourcing platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className={`${inter.className} min-h-dvh antialiased`}>
        <AppRouteLoader />
        {children}
        <AppToast />
        <ThemedDatePicker />
      </body>
    </html>
  );
}
