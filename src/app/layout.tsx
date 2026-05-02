import "./globals.css";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Nunito } from "next/font/google";
import { APP_UPDATED_LABEL, APP_VERSION } from "@/lib/app-meta";
import { SpeedInsights } from "@vercel/speed-insights/next";

const nunito = Nunito({ subsets: ["latin"], weight: ["600", "700", "800"] });
const REPOSITORY_URL =
  "https://github.com/marlonangeli/duolingo-streak-tracker";

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
      <SpeedInsights />
      <body className={nunito.className}>
        <div className="flex min-h-screen flex-col">
          <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-[color:color-mix(in_oklab,var(--card)_90%,black_10%)]/90 backdrop-blur-xl">
            <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-8">
              <Link
                href="/"
                className="duo-brand duo-interactive inline-flex items-center gap-3 rounded-full px-1 py-1 text-white"
              >
                <span className="duo-brand-logo" aria-hidden="true">
                  <Image
                    src="/logotype.svg"
                    alt=""
                    width={88}
                    height={21}
                    priority
                    className="duo-brand-logo-primary h-[21px] w-auto"
                  />
                  <Image
                    src="/logotype-white.svg"
                    alt=""
                    width={88}
                    height={21}
                    priority
                    className="duo-brand-logo-hover h-[21px] w-auto"
                  />
                </span>
                <span className="duo-brand-text text-sm font-black tracking-[0.18em] text-slate-100 uppercase">
                  Streak Tracker
                </span>
              </Link>

              <nav className="flex items-center gap-2 text-[10px] font-black uppercase tracking-wide text-slate-200 sm:text-xs">
                <Link
                  href="/#help"
                  className="duo-link duo-interactive px-3 py-1.5"
                >
                  Help
                </Link>
                <Link
                  href="/#legal"
                  className="duo-link duo-interactive px-3 py-1.5"
                >
                  Legal
                </Link>
              </nav>
            </div>
          </header>

          <div className="flex-1 pt-20 sm:pt-24">{children}</div>
          <footer className="px-4 pb-6 pt-2">
            <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-3 sm:flex-row">
              <p className="text-center text-xs font-bold uppercase tracking-[0.22em] text-[var(--duo-wolf)]">
                v{APP_VERSION} · {APP_UPDATED_LABEL}
              </p>
              <a
                href={REPOSITORY_URL}
                target="_blank"
                rel="noreferrer"
                className="duo-link duo-interactive px-3 py-1.5 text-[10px] font-black uppercase tracking-wide text-white sm:text-xs"
              >
                GitHub
              </a>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
