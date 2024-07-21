"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.character_command = void 0;
const basic_1 = require("./basic");
function character_command(core) {
    // character command
    // Used to create a character, and save it to script field in archive storage,
    // so that it can be used when the archive is loaded next time the game starts
    // by loading the archive.
    // Command rule:
    //  1. the first argument is the name of the character
    //  2. the second argument is the short name of the character
    //  3. the third argument is the display name of the character
    // if the third argument is not specified, the display name will be the same as the short name
    // if the short name is conflict with an existing character, the script will throw an error
    core.script.use((ctx, next) => {
        if (ctx.rawtext.trim().split(" ")[0].toLowerCase() !== "character")
            return next();
        if (ctx.slicedArgs.length > 3)
            throw `Character Command: incorrect amount of args`;
        if (ctx.slicedArgs.length === 1)
            throw `Character Command: incorrect amount of args`;
        if (ctx.slicedArgs.length === 2)
            throw `Character Command: display name not specified`;
        if (ctx.slicedArgs[1].isQuoted)
            throw `Character Command: short name should not be quoted`;
        // Check if the short name is conflict with an existing character
        let short_name = ctx.slicedArgs[1].str;
        let characterMap = getCharacterMap();
        if (characterMap[short_name] != null) {
            if (characterMap[short_name].declare_info.path === ctx.currentPath &&
                characterMap[short_name].declare_info.index === ctx.currentLineIndex) {
            }
            else
                throw `Character Command: short name [${short_name}] conflict, at file [${characterMap[short_name].declare_info.path}] line [${characterMap[short_name].declare_info.index + 1}] and `;
        }
        else {
            let display_name = ctx.slicedArgs[2].str;
            characterMap[short_name] = buildCharacterInfo(short_name, display_name);
        }
        function buildCharacterInfo(short_name, display_name) {
            return {
                short_name,
                display_name,
                declare_info: {
                    path: ctx.currentPath,
                    index: ctx.currentLineIndex,
                },
            };
        }
    });
    function getCharacterMap() {
        // // Check core.storage.archiveData
        // if (typeof core.storage.archiveData == null)
        //   throw `[HZEngine] ArchiveData is null`;
        // if (typeof core.storage.archiveData != "object")
        //   throw `[HZEngine] ArchiveData is not a object(Record or Array)`;
        // if (Array.isArray(core.storage.archiveData))
        //   throw `[HZEngine] ArchiveData is an Array`;
        // // Check core.storage.archiveData.script
        // if (core.storage.archiveData.script == null) {
        //   console.log(`[HZEngine] ArchiveData.script is null, create it`);
        //   core.storage.archiveData.script = {};
        // }
        // if (typeof core.storage.archiveData.script != "object")
        //   throw `[HZEngine] ArchiveData.script is not a object(Record or Array)`;
        // if (Array.isArray(core.storage.archiveData.script))
        //   throw `[HZEngine] ArchiveData.script is an Array`;
        // // Check core.storage.archiveData.script.characterMap
        // if (core.storage.archiveData.script.characterMap == null) {
        //   console.log(
        //     `[HZEngine] ArchiveData.script.characterMap is null, create it`
        //   );
        //   core.storage.archiveData.script.characterMap = {};
        // }
        // if (typeof core.storage.archiveData.script.characterMap != "object")
        //   throw `[HZEngine] ArchiveData.script.characterMap is not a object(Record or Array)`;
        // if (Array.isArray(core.storage.archiveData.script.characterMap))
        //   throw `[HZEngine] ArchiveData.script.characterMap is an Array`;
        // return core.storage.archiveData.script.characterMap as any; // TODO
        return core.storage.getSaveableData(core.storage.archiveData, true, "script", "characterMap");
    }
    // Gramma: %short_name% "{message}"
    core.script.use((ctx, next) => {
        if (ctx.slicedArgs[0].isQuoted)
            return next();
        let characterMap = getCharacterMap();
        let short_name = ctx.slicedArgs[0].str;
        for (let key in characterMap) {
            // console.log(`Character Say Command: key=${key} sn=${short_name}`);
            if (key === short_name) {
                if (ctx.slicedArgs.length != 2)
                    throw `Character Say Command: incorrect amount of args`;
                console.log("Character Say Command:", short_name, ctx.slicedArgs[1].str);
                (0, basic_1.sayAction)(core, characterMap[key].display_name, ctx.slicedArgs[1].str);
                core.system.pause();
                return;
            }
        }
        return next();
    });
}
exports.character_command = character_command;
