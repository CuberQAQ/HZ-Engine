import * as hmFS from "@zos/fs";
export declare function readdirAssetsSync(option: {
    path: string;
}): string[] | undefined;
export declare function isFileDataSync(option: {
    path: string;
}): boolean;
export declare function isFileAssetsSync(option: {
    path: string;
}): boolean;
export declare function writeFileAssetsSync(opt: {
    path: string;
    data: string | ArrayBuffer | DataView;
    options?: hmFS.writeFileSync.Options;
}): number;
export declare function readFileAssetsSync(opt: {
    path: string;
    options?: hmFS.readFileSync.Options;
}): string | ArrayBuffer;
