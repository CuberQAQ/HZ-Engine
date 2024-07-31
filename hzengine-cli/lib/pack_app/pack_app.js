import path from "path";
import fs from "fs-extra";
import * as fflate from "fflate";
import { fileURLToPath } from "url";
import chalk from "chalk";

let __filename = fileURLToPath(import.meta.url);
let __dirname = path.dirname(__filename);

export function packApp(project_path, target_path) {
  // copy to launcher
  fs.removeSync(
    path.join(__dirname, "0.1.0-launcher-device", "assets", "raw", "project")
  );
  fs.copySync(
    project_path,
    path.join(__dirname, "0.1.0-launcher-device", "assets", "raw", "project")
  );

  // zip launcher to zpk folder
  {
    console.log(chalk.greenBright(`Zipping launcher...`));
    let launcher_path = path.join(__dirname, "0.1.0-launcher-device");
    let zipable_data = buildZipableData(launcher_path);
    let launcher_zip = fflate.zipSync(zipable_data);
    fs.writeFileSync(
      path.join(__dirname, "0.1.0-launcher-zpk", "device.zip"),
      launcher_zip
    );
  }

  // zip zpk to build folder
  {
    console.log(chalk.greenBright(`Zipping zpk...`));
    let zpk_path = path.join(__dirname, "0.1.0-launcher-zpk");
    let zipable_data = buildZipableData(zpk_path);
    let zpk_zip = fflate.zipSync(zipable_data);
    fs.writeFileSync(target_path, zpk_zip);    
  }


  // delete launcher project
  fs.removeSync(
    path.join(__dirname, "0.1.0-launcher-device", "assets", "raw", "project")
  );

  // delete zpk device.zip
  fs.removeSync(path.join(__dirname, "0.1.0-launcher-zpk", "device.zip"));
}

function buildZipableData(project_path) {
  let zipable_data = {};
  function traverseDir(dir) {
    let files = fs.readdirSync(path.join(project_path, dir));
    for (let file of files) {
      let file_path = path.join(project_path, dir, file);
      if (fs.statSync(file_path).isDirectory()) {
        zipable_data[path.join(dir, file) + "/"] = new Uint8Array(0);
        traverseDir(path.join(dir, file));
      } else {
        let content = fs.readFileSync(file_path);
        zipable_data[path.join(dir, file)] = content;
      }
    }
  }
  traverseDir("");
  return zipable_data;
}
