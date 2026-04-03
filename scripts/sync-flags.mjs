import { copyFile, mkdir, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(scriptDirectory, "..");

const sourceDirectory = path.join(
  repositoryRoot,
  "node_modules",
  "flag-icons",
  "flags",
  "4x3"
);

const destinationDirectory = path.join(repositoryRoot, "public", "flags");

const syncFlags = async () => {
  await mkdir(destinationDirectory, { recursive: true });

  const entries = await readdir(sourceDirectory, { withFileTypes: true });

  const files = entries
    .filter((entry) => entry.isFile() && entry.name.endsWith(".svg"))
    .map((entry) => entry.name);

  await Promise.all(
    files.map((fileName) =>
      copyFile(
        path.join(sourceDirectory, fileName),
        path.join(destinationDirectory, fileName)
      )
    )
  );

  console.log(`Synced ${files.length} flag SVG files to public/flags.`);
};

await syncFlags();
