#!/usr/bin/env node
import config from "configstore";
import { program } from "commander";
import chalk from "chalk";
import figlet from "figlet";
import clear from "clear";
import inquirer from "inquirer";
import { existsSync, mkdir, readdirSync } from "fs";
import fs from "fs-extra";
import { fileURLToPath } from "node:url";
import path from "path";
import child_process from "child_process";
import { isHzProject, readHzProject } from "./lib/hzproject.js";
import { imageConvert } from "./lib/image_convert/image-convert.js";
import { packApp } from "./lib/pack_app/pack_app.js";
import { buildHzpk_v1 } from "./lib/hzpk-1.0.0.js";
const version = "0.1.5-dev";

program
  .name("hzengine-cli")
  .aliases(["hzengine", "hze"])
  .description("HZ-Engine CLI")
  .version(version);

program.addHelpText("beforeAll", printHeadline);

let __filename = fileURLToPath(import.meta.url);
let __dirname = path.dirname(__filename);

program
  .command("create [project_name]")
  .description("Create a new project")
  .action((project_name) => {
    if (existsSync("./" + project_name)) {
      program.error(chalk.redBright(`Project ${project_name} already exists!`));
      return;
    }

    let templates = getTemplateList();
    if (templates.length == 0) {
      program.error(chalk.redBright(`No template found!`));
      return;
    }
    inquirer
      .prompt([
        {
          type: "list",
          name: "template",
          choices: getTemplateList(),
          default: getTemplateList()[0],
          message: "Choose a template for your project",
        },
      ])
      .then((answers) => {
        let template = answers["template"];

        let templatePath = path.join(__dirname, `/templates/${template}`);
        let projectPath = `./${project_name}`;
        if (!existsSync(templatePath)) {
          program.error(chalk.redBright(`Template ${template} not found!`));
          return;
        }
        if (existsSync(projectPath)) {
          program.error(
            chalk.redBright(`Project ${project_name} already exists!`)
          );
          return;
        }
        // 拷贝模板到目标目录
        console.log(
          chalk.greenBright(`Copying template ${template} to ${project_name}`)
        );
        fs.copySync(templatePath, projectPath);
        console.log(chalk.greenBright(`Project ${project_name} created!`));
        // 安装依赖
        // console.log(chalk.greenBright(`Installing dependencies...`));
        // npmInstall(projectPath)
        //   .then(() => {
        //     console.log(chalk.greenBright(`Dependencies installed!`));
        //     console.log(chalk.greenBright(`Project ${project_name} created!`));
        //   })
        //   .catch((error) => {
        //     program.error(
        //       chalk.redBright(`Failed to install dependencies: \n${error}`)
        //     );
        //   });
      });
  });

program
  .command("build")
  .description("Build the project")
  .action(() => {
    console.log(chalk.greenBright(`Building project...`));
    // check if is a hz project
    if (!isHzProject(process.cwd())) {
      program.error(chalk.redBright(`Not a hz project!`));
      return;
    }

    // check version
    let project_json = fs.readJsonSync(
      path.join(process.cwd(), "project.json")
    );
    if (project_json.hz.version !== "1.0.0") {
      program.error(
        chalk.redBright(
          `The hz project version not supported (${project_json.hz.version})`
        )
      );
    }

    // convert image
    fs.removeSync(path.join(process.cwd(), "build", ".cache"));
    fs.mkdirSync(path.join(process.cwd(), "build", ".cache", "converted"), {
      recursive: true,
    });
    imageConvert(
      path.join(process.cwd(), "project"),
      path.join(process.cwd(), "build", ".cache", "converted"),
      path.join(process.cwd(), "build", ".cache", "converting")
    );


    let project_info = readHzProject(process.cwd());
    let zip_file_name = `${project_info.name}-${project_info.version}-${Date.now()}.zip`;


    // build launcher
    packApp(
      path.join(process.cwd(), "build", ".cache", "converted"),
      path.join(process.cwd(), "build", zip_file_name)
    );

    // delete converted image
    fs.removeSync(path.join(process.cwd(), "build", ".cache", "converted"));

    console.log(chalk.greenBright(`Project built!`));
  });

program
  .command("pack")
  .description("Pack the project into hzpk format")
  .action(() => {
    console.log(chalk.greenBright(`Packing project...`));
    // check if is a hz project
    if (!isHzProject(process.cwd())) {
      program.error(chalk.redBright(`Not a hz project!`));
      return;
    }

    let project_info = readHzProject(process.cwd());
    let hzpk_file_name = `${project_info.name}-${project_info.version}.hzpk`;

    fs.mkdirSync(path.join(process.cwd(), "build"), { recursive: true });
    fs.writeFileSync(
      path.join(process.cwd(), "build", hzpk_file_name),
      buildHzpk_v1({
        name: project_info.name,
        author: project_info.author,
        description: project_info.description,
        version: project_info.version,
        root_dir: path.join(process.cwd(), "project"),
      })
    );

    // unpackHzpk_v1(
    //   readFileSync("test.hzpk"),
    //   "D:\\Something\\WatchDev\\HZ-Engine\\hzengine-cli\\lib\\test\\hzpk_project"
    // );
  });

program.parse(process.argv);

function printHeadline() {
  clear();
  return (
    chalk.redBright(figlet.textSync("HZ-Engine", "Speed")) +
    chalk.gray(version) +
    chalk.italic(
      chalk.gray("\nPowered by ") + chalk.yellowBright("@CuberQAQ")
    ) +
    " <" +
    chalk.underline("https://github.com/CuberQAQ/hzengine-cli") +
    ">"
  );
}

function getTemplateList() {
  return readdirSync(path.join(__dirname, `/templates`));
}

function npmInstall(rootpath) {
  return new Promise((resolve, reject) => {
    const child = child_process.exec(
      `npm install`,
      { cwd: rootpath },
      (error, stdout, stderr) => {
        if (error) {
          reject(error);
        } else {
          resolve(stdout);
        }
      }
    );
  });
}
