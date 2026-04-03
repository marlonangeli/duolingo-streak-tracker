import Link from "next/link";

const NotFound = () => {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl items-center px-4 py-10 sm:px-8">
      <section className="duo-panel w-full p-8 text-center">
        <p className="text-xs uppercase tracking-[0.25em] text-slate-400">404</p>
        <h1 className="mt-2 text-3xl font-extrabold text-white">User not found</h1>
        <p className="mt-3 text-sm text-slate-300">
          We could not load public stats for this Duolingo profile.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex rounded-xl bg-emerald-500 px-4 py-2 font-semibold text-slate-950 hover:bg-emerald-400"
        >
          Back to home
        </Link>
      </section>
    </main>
  );
};

export default NotFound;
