"use client";

import { FormEvent, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

const Home = () => {
  const router = useRouter();
  const [username, setUsername] = useState("marlonangeli");
  const repositoryUrl =
    "https://github.com/marlonangeli/duolingo-streak-tracker";

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const normalizedUsername = username.trim().toLowerCase();

    if (!normalizedUsername) {
      return;
    }

    router.push(`/${normalizedUsername}`);
  };

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-8 sm:px-8 sm:py-10">
      <section className="duo-panel w-full p-6 sm:p-10">
        <div className="mt-5 grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-5xl">
              Public Duolingo stats and SVG cards for GitHub README profiles
            </h1>

            <p className="mt-4 max-w-3xl text-sm text-slate-300 sm:text-base">
              Enter a Duolingo username to generate a profile page with API
              payloads, embeddable markdown snippets, and lower-contrast SVG
              card variants ready for profile READMEs.
            </p>
          </div>

          <div className="relative mx-auto w-full max-w-xs lg:max-w-sm">
            <Image
              src="/brand/characters/duo-wave.svg"
              alt="Duolingo mascot"
              width={320}
              height={306}
              priority
              unoptimized
              className="mx-auto h-auto w-full"
            />
          </div>
        </div>

        <form
          className="mt-8 flex flex-col gap-3 sm:flex-row"
          onSubmit={onSubmit}
        >
          <input
            type="text"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            placeholder="Duolingo username"
            className="w-full rounded-xl border border-white/18 bg-slate-900/30 px-4 py-3 text-white outline-none transition focus:border-white/40"
          />
          <button
            type="submit"
            className="duo-button duo-interactive rounded-xl border border-[#86d85e] bg-[#66b93b] px-5 py-3 font-black text-[#10210a] hover:brightness-105"
          >
            Open Profile
          </button>
        </form>

        <div className="mt-6 grid gap-3 text-sm text-slate-300 sm:grid-cols-2">
          <Link
            href="/api/stats/marlonangeli"
            className="duo-link duo-interactive rounded-lg px-4 py-3"
          >
            GET /api/stats/:user
          </Link>
          <Link
            href="/api/card/marlonangeli?theme=polar&variant=default"
            className="duo-link duo-interactive rounded-lg px-4 py-3"
          >
            GET /api/card/:user
          </Link>
        </div>
      </section>

      <section id="help" className="duo-panel scroll-mt-28 p-6 sm:p-8">
        <h2 className="text-2xl font-extrabold text-white">Help</h2>
        <p className="mt-3 max-w-3xl text-sm text-slate-300 sm:text-base">
          Use the generated profile page to preview card variants, then copy the
          markdown snippet and paste it into your GitHub README. The card
          endpoint supports theme and variant query params, so you can link
          directly to the style you prefer.
        </p>
        <div className="mt-4 flex flex-wrap gap-3 text-sm text-slate-200">
          <Link
            href="/marlonangeli"
            className="duo-link duo-interactive rounded-full px-4 py-2"
          >
            Open example profile
          </Link>
          <a
            href={`${repositoryUrl}#embed-in-github-readme`}
            target="_blank"
            rel="noreferrer"
            className="duo-link duo-interactive rounded-full px-4 py-2"
          >
            README embed guide
          </a>
        </div>
      </section>

      <section id="legal" className="duo-panel scroll-mt-28 p-6 sm:p-8">
        <h2 className="text-2xl font-extrabold text-white">Legal</h2>
        <p className="mt-3 max-w-3xl text-sm text-slate-300 sm:text-base">
          This project is an independent community tool and is not affiliated
          with, endorsed by, or sponsored by Duolingo. It uses only public
          unauthenticated profile data.
        </p>
        <div className="mt-4 flex flex-wrap gap-3 text-sm text-slate-200">
          <a
            href={repositoryUrl}
            target="_blank"
            rel="noreferrer"
            className="duo-link duo-interactive rounded-full px-4 py-2"
          >
            GitHub repository
          </a>
          <a
            href={`${repositoryUrl}/blob/main/LICENSE`}
            target="_blank"
            rel="noreferrer"
            className="duo-link duo-interactive rounded-full px-4 py-2"
          >
            MIT license
          </a>
          <Link
            href="/#help"
            className="duo-link duo-interactive rounded-full px-4 py-2"
          >
            Help section
          </Link>
        </div>
      </section>
    </main>
  );
};

export default Home;
