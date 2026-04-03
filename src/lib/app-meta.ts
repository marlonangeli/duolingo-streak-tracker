import packageJson from "../../package.json";

export const APP_VERSION = packageJson.version;

export const APP_UPDATED_LABEL =
  process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? "local";
