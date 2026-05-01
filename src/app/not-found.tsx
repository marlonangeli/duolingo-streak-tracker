import Image from "next/image";
import Link from "next/link";

const HomeArrowIcon = () => (
  <svg
    aria-hidden="true"
    viewBox="0 0 16 16"
    className="size-4"
    fill="none"
  >
    <path
      d="M8.75 3.5 4 8l4.75 4.5M4.75 8H14"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
    />
  </svg>
);

const NotFound = () => {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl items-center px-4 py-10 sm:px-8">
      <section className="duo-panel w-full p-8 text-center">
        <Image
          src="/brand/characters/duo-error.svg"
          alt="Duolingo error mascot"
          width={156}
          height={157}
          unoptimized
          className="mx-auto h-auto w-32 sm:w-36"
        />
        <p className="text-xs uppercase tracking-[0.25em] text-slate-400">404</p>
        <h1 className="mt-2 text-3xl font-extrabold text-white">User not found</h1>
        <p className="mt-3 text-sm text-slate-300">
          We could not load public stats for this Duolingo profile.
        </p>
        <Link
          href="/"
          className="duo-button-link duo-button--sm mt-6"
        >
          <HomeArrowIcon />
          Back to home
        </Link>
      </section>
    </main>
  );
};

export default NotFound;
