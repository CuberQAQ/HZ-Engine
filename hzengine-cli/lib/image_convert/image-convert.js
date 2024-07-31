import child_process from "child_process";
import fs from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";
import * as fflate from "fflate";
import chalk from 'chalk'
// import {} from 'unzip'
// import { createReadStream } from 'fs';
let __filename = fileURLToPath(import.meta.url);
let __dirname = path.dirname(__filename);
// child_process.execSync("zeus build", {cwd: path.join(__dirname, "zeus-project")})

export function imageConvert(src_path, dst_path) {
  // clean workspace
  let workspace_path = path.join(
    __dirname,
    "zeus-project",
    "assets",
    "nxp",
    "workspace"
  );
  if (fs.existsSync(workspace_path)) {
    fs.removeSync(workspace_path);
    fs.mkdirSync(workspace_path);
  }
  // copy src image to zeus project
  fs.copySync(src_path, workspace_path);

  // convert (build zeus project)
  console.log(chalk.greenBright("Converting image..."));
  child_process.execSync("zeus build", {
    cwd: path.join(__dirname, "zeus-project"),
  });

  // unzip zpk
  let zpk_name = fs.readdirSync(
    path.join(__dirname, "zeus-project", "dist")
  )[0];
  let zpk_path = path.join(__dirname, "zeus-project", "dist", zpk_name);
  let zpk = fs.readFileSync(zpk_path);
  let unziped = fflate.unzipSync(zpk);
  let unzip_path = path.join(__dirname, "zeus-project", "dist", "unzip");
  for (let file in unziped) {
    fs.mkdirSync(path.join(unzip_path, path.dirname(file)), {
      recursive: true,
    });
    fs.writeFileSync(path.join(unzip_path, file), unziped[file], {
      flag: "w+",
    });
  }

  // unzip xx.zpk
  let device_zip_name = fs
    .readdirSync(path.join(__dirname, "zeus-project", "dist", "unzip"))
    .find((name) => name.endsWith(".zpk"));
  let device_zip_path = path.join(
    __dirname,
    "zeus-project",
    "dist",
    "unzip",
    device_zip_name
  );
  let device_zip = fs.readFileSync(device_zip_path);
  let unzip_device = fflate.unzipSync(device_zip);
  let unzip_device_path = path.join(
    __dirname,
    "zeus-project",
    "dist",
    "unzip",
    "device"
  );
  for (let file in unzip_device) {
    fs.mkdirSync(path.join(unzip_device_path, path.dirname(file)), {
      recursive: true,
    });
    fs.writeFileSync(path.join(unzip_device_path, file), unzip_device[file], {
      flag: "w+",
    });
  }

  // unzip device.zip
  {
    let device_name = fs
      .readdirSync(
        path.join(__dirname, "zeus-project", "dist", "unzip", "device")
      )
      .find((name) => name.endsWith("device.zip"));
    let device_path = path.join(
      __dirname,
      "zeus-project",
      "dist",
      "unzip",
      "device",
      device_name
    );
    let device = fs.readFileSync(device_path);
    let unzip_device = fflate.unzipSync(device);
    let unzip_device_path = path.join(
      __dirname,
      "zeus-project",
      "dist",
      "unzip",
      "device",
      "unzip"
    );
    // console.log(unzip_device);
    for (let file in unzip_device) {
      if(file.endsWith("/")) {
        fs.mkdirSync(path.join(unzip_device_path, file), {
          recursive: true,
        })
        continue
      }
      fs.mkdirSync(path.join(unzip_device_path, path.dirname(file)), {
        recursive: true,
      });
      fs.writeFileSync(path.join(unzip_device_path, file), unzip_device[file], {
        flag: "w+",
      });
    }
  }
  
  // copy workspace to dst
  fs.copySync(
    path.join(__dirname, "zeus-project", "dist", "unzip", "device", "unzip", "assets", "workspace"),
    dst_path
  );

  // delete dist
  fs.removeSync(path.join(__dirname, "zeus-project", "dist"));

  // delete workspace
  fs.removeSync(path.join(__dirname, "zeus-project", "assets", "nxp", "workspace"));

  console.log(chalk.greenBright("Image converted!"));

}

// imageConvert(
//   "D:\\Something\\WatchDev\\HZ-Engine\\demo\\watch_app\\assets\\raw\\project",
//   "./test_convert"
// );
