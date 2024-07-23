import { readFileAssetsSync } from "../storage/fs";

let cache = new Map();
export function readline(path: string, line_index: number): string | undefined {
  if (cache.has(path)) {
    return cache.get(path)[line_index];
  }
    // Get Command
    let hzsContent = readFileAssetsSync({
        path,
        options: { encoding: "utf8" },
      }) as string;
    let file = hzsContent.split(/\r?\n|(?<!\n)\r/)
    cache.set(path, file);
    return file[line_index];
}