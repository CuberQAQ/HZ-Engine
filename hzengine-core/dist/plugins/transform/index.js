import { AnimationPlugin } from "./hz_anime.js";
import { Animation, Profile } from "./animation.js";
// import hmFS from "@zos/fs";
import { getTransitionMap, registerHzscriptCommands } from "./commands.js";
export function registerPlugin(core) {
    let animationPlugin = new AnimationPlugin(core);
    let profileMap = {};
    registerHzscriptCommands(core);
    core.on("afterLoadProject", () => {
        profileMap = core.storage.getSaveableData(core.storage.preloadedData, false, "animation", "profileMap");
    });
    function getProfile(name) {
        let profile_item = profileMap[name];
        if (!profile_item) {
            core.debug.log(`Animation profile [${name}] not found`);
            return null;
        }
        let str = core.platform.readFileSync({
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
            return (_a = getTransitionMap(core)[name]) !== null && _a !== void 0 ? _a : null;
        }
    };
}
export { Animation, Profile, AnimationPlugin };
