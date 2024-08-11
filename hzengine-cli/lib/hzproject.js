// import path from "@cuberqaq/path-polyfill";\
import path from 'path'
import fs from "fs-extra";

export function isHzProject(root_dir) {
    if (!root_dir) {
        throw new Error("root_dir is required");
    }
    if (!fs.existsSync(root_dir)) {
        throw new Error("root_dir is not exists");
    }
    
    // read project.json
    let project_json = fs.readJsonSync(path.join(root_dir, "project.json"));
    if (!project_json) {
        // throw new Error("project.json is not exists");

        return false;
    }

    // check hz_version
    if(typeof project_json?.hz?.version !== "string") {
        // throw new Error("hz_version is not 1.0.0");

        return false;
    }

    return true;
}

export function readHzProject(root_dir) {
    if (!isHzProject(root_dir)) {
        throw new Error("not hz project");
    }
    return fs.readJsonSync(path.join(root_dir, "project.json"));
}