import type { Metadata, Viewport } from "next";
import "./globals.css";
import { SwRegister } from "@/components/relax/sw-register";

export const metadata: Metadata = {
  title: "Shanti — Relaxation Assistant",
  description:
    "A calm talking companion by MeiVeeram — guided breathing, body-scan relaxation and soothing voice. For our workers' rest and recovery.",
  applicationName: "Shanti",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Shanti",
  },
  icons: {
    icon: "/icon-192.png",
    apple: "/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#06170f",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <SwRegister />
        {children}
      </body>
    </html>
  );
}
