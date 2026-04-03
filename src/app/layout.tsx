import "./globals.css";
import type { Metadata } from "next";
import { Nunito } from "next/font/google";

const nunito = Nunito({ subsets: ["latin"], weight: ["600", "700", "800"] });

export const metadata: Metadata = {
  title: "Duolingo Streak Tracker",
  description:
    "Public Duolingo stats API and embeddable SVG cards for GitHub profiles.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={nunito.className}>{children}</body>
    </html>
  );
}
