import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { MSWProvider } from "@/lib/msw/init";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CLAiMS — fraud + dispute ops",
  description: "AI risk investigation demo — Sarah Chen case study",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-bg-0 text-ink">
        <MSWProvider>{children}</MSWProvider>
      </body>
    </html>
  );
}
