import "./globals.css";
import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import { APP_UPDATED_LABEL, APP_VERSION } from "@/lib/app-meta";

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
      <body className={nunito.className}>
        <div className="flex min-h-screen flex-col">
          <div className="flex-1">{children}</div>
          <footer className="px-4 pb-6 pt-2 text-center text-xs font-bold uppercase tracking-[0.22em] text-[var(--duo-wolf)]">
            v{APP_VERSION} · {APP_UPDATED_LABEL}
          </footer>
        </div>
      </body>
    </html>
  );
}
