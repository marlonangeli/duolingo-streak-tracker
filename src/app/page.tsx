"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const Home = () => {
  const router = useRouter();
  const [username, setUsername] = useState("marlonangeli");

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const normalizedUsername = username.trim().toLowerCase();

    if (!normalizedUsername) {
      return;
    }

    router.push(`/${normalizedUsername}`);
  };

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl items-center px-4 py-10 sm:px-8">
      <section className="duo-panel w-full p-6 sm:p-10">
        <div className="inline-flex rounded-full border border-emerald-300/30 bg-emerald-300/10 px-3 py-1 text-xs font-medium tracking-wide text-emerald-100">
          Duolingo Streak Tracker
        </div>

        <h1 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-5xl">
          Public Duolingo stats + SVG cards for GitHub README
        </h1>

        <p className="mt-4 max-w-3xl text-sm text-slate-300 sm:text-base">
          Enter a Duolingo username to generate a profile page with API payloads,
          embeddable markdown snippets, and SVG card variants ready for profile
          READMEs.
        </p>

        <form className="mt-8 flex flex-col gap-3 sm:flex-row" onSubmit={onSubmit}>
          <input
            type="text"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            placeholder="Duolingo username"
            className="w-full rounded-xl border border-slate-500/50 bg-slate-900/70 px-4 py-3 text-white outline-none transition focus:border-emerald-300"
          />
          <button
            type="submit"
            className="rounded-xl bg-emerald-500 px-5 py-3 font-semibold text-slate-950 transition hover:bg-emerald-400"
          >
            Open profile
          </button>
        </form>

        <div className="mt-6 grid gap-3 text-sm text-slate-300 sm:grid-cols-2">
          <Link
            href="/api/stats/marlonangeli"
            className="rounded-lg border border-slate-600/50 bg-slate-900/40 px-4 py-3 hover:border-slate-400"
          >
            GET /api/stats/:user
          </Link>
          <Link
            href="/api/card/marlonangeli?theme=duo&variant=default"
            className="rounded-lg border border-slate-600/50 bg-slate-900/40 px-4 py-3 hover:border-slate-400"
          >
            GET /api/card/:user
          </Link>
        </div>
      </section>
    </main>
  );
};

export default Home;
