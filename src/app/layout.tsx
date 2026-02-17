import type { Metadata, Viewport } from "next";
import { MiniKitProvider } from "@/lib/minikit-provider";
import { BottomNav } from "@/components/BottomNav";
import "./globals.css";

export const metadata: Metadata = {
  title: "TrueVoice - Human-Verified Reviews",
  description:
    "Every review from a real, verified human. Powered by World ID. No bots, no fakes, no manipulation.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <MiniKitProvider>
          {children}
          <BottomNav />
        </MiniKitProvider>
      </body>
    </html>
  );
}
