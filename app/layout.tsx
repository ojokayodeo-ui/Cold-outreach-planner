import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Cold Outreach Intelligence",
  description:
    "From research to ready-to-send messages — AI-powered cold outreach planning in 5 steps.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
