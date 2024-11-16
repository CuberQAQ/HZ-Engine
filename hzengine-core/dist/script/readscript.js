// import * as hmFS from '@zos/fs'
let cache = new Map();
export function readline(_core, path, line_index) {
    if (cache.has(path)) {
        return cache.get(path)[line_index];
    }
    // Get Command
    let hzsContent = _core.platform.readFileSync({
        path,
        options: { encoding: "utf8" },
    });
    let file = hzsContent.split(/\r?\n|(?<!\n)\r/);
    cache.set(path, file);
    return file[line_index];
}
