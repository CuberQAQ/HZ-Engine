"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnimationPlugin = exports.Profile = exports.Animation = void 0;
exports.registerPlugin = registerPlugin;
const hz_anime_1 = require("./hz_anime");
Object.defineProperty(exports, "AnimationPlugin", { enumerable: true, get: function () { return hz_anime_1.AnimationPlugin; } });
const animation_1 = require("./animation");
Object.defineProperty(exports, "Animation", { enumerable: true, get: function () { return animation_1.Animation; } });
Object.defineProperty(exports, "Profile", { enumerable: true, get: function () { return animation_1.Profile; } });
const fs_1 = __importDefault(require("@zos/fs"));
const commands_1 = require("./commands");
function registerPlugin(core) {
    let animationPlugin = new hz_anime_1.AnimationPlugin(core);
    let profileMap = {};
    (0, commands_1.registerHzscriptCommands)(core);
    core.on("afterLoadProject", () => {
        profileMap = core.storage.getSaveableData(core.storage.preloadedData, false, "animation", "profileMap");
    });
    function getProfile(name) {
        let profile_item = profileMap[name];
        if (!profile_item) {
            core.debug.log(`Animation profile [${name}] not found`);
            return null;
        }
        let str = fs_1.default.readFileSync({
            path: profile_item[0],
            options: {
                encoding: "utf8",
            },
        });
        if (typeof str !== "string") {
            core.debug.log(`Animation profile file [${name}] not found`);
            return null;
        }
        try {
            return JSON.parse(str);
        }
        catch (error) {
            core.debug.log(`Animation profile file [${name}] parse error:`, error);
        }
        return null;
    }
    function applyTransform(names, target, isSave = false, destroyOnEnd = false) {
        let profile = null;
        if (names.length === 1) {
            profile = getProfile(names[0]);
        }
        else if (names.length > 1) {
            let syncs = [];
            for (let i = 0; i < names.length; i++) {
                let profile = getProfile(names[i]);
                if (profile)
                    syncs.push(profile);
            }
            profile = { syncs };
        }
        if (!profile)
            profile = [];
        animationPlugin.applyAnimation({
            profile,
            targetView: target,
            options: {
                isSave,
                destroyOnEnd,
            },
        });
    }
    class TransformRouteStrategy {
        constructor(outTransforms, inTransforms) {
            this.outTransforms = outTransforms;
            this.inTransforms = inTransforms;
        }
        create(viewName, layer, prop, ui, isSave) {
            let view = ui.createView(viewName, layer, prop, isSave);
            this.inTransforms && applyTransform(this.inTransforms, view, isSave);
            return view;
        }
        destroy(viewInstance, ui) {
            if (this.outTransforms) {
                applyTransform(this.outTransforms, viewInstance, viewInstance.isSave, true);
            }
            else {
                ui.destroyView(viewInstance);
            }
        }
    }
    return {
        applyTransform,
        getProfile,
        createStrategy(outTransforms, inTransforms) {
            return new TransformRouteStrategy(outTransforms, inTransforms);
        },
        animationPlugin,
        getTransition(name) {
            var _a;
            return (_a = (0, commands_1.getTransitionMap)(core)[name]) !== null && _a !== void 0 ? _a : null;
        }
    };
}
