#!/usr/bin/env node
import config from "configstore";
import { program } from "commander";
import chalk from "chalk";
import figlet from "figlet";
import clear from "clear";
import inquirer from "inquirer";
import { existsSync, readdirSync } from "fs";
import fs from 'fs-extra'
import { fileURLToPath } from 'node:url'
import path from 'path'
import child_process from "child_process";
const version = "1.0.0";

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
    if(templates.length == 0) {
      program.error(chalk.redBright(`No template found!`));
      return;
    }
    inquirer.prompt([
      {
        type: "list",
        name: "template",
        choices: getTemplateList(),
        default: getTemplateList()[0],
        message: "Choose a template for your project",
      },
    ]).then((answers) => {
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
      console.log(chalk.greenBright(`Installing dependencies...`));
      npmInstall(projectPath).then(() => {
        console.log(chalk.greenBright(`Dependencies installed!`));
        console.log(chalk.greenBright(`Project ${project_name} created!`));
      }).catch((error) => {
        program.error(chalk.redBright(`Failed to install dependencies: \n${error}`));
      })

    })
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
    return readdirSync(path.join(__dirname, `/templates`))
}

function npmInstall(rootpath) {
    return new Promise((resolve, reject) => {
        const child = child_process.exec(`npm install`, { cwd: rootpath }, (error, stdout, stderr) => {
            if (error) {
                reject(error)
            } else {
                resolve(stdout)
            }
        })
    })
}