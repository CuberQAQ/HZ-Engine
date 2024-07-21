import { readFileAssetsSync } from "../storage/fs";

export function readline(path: string, line_index: number): string | undefined {
    // Get Command
    let hzsContent = readFileAssetsSync({
        path,
        options: { encoding: "utf8" },
      }) as string;
    return hzsContent.split(/\r?\n|(?<!\n)\r/)[line_index];
}