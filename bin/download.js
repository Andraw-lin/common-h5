const fs = require("fs");
const download = require("download-git-repo"); // 用于下载相应的github或者gitlab开发模板
const handlebars = require("handlebars"); // 根据用户输入的内容动态更新package.json
const inquirer = require("inquirer"); // 基于Node的与用户进行交互的命令行工具
const ora = require("ora"); // 用于命令行loading的加载图标展示
const chalk = require("chalk"); // 用于修改命令行字体样式
const symbols = require("log-symbols"); // 为各种日志级别提供着色的符号--错误正确警示
const shell = require('shelljs'); // 用于自动执行一些自动化命令

const downloadFunc = async (name) => {
  if (!fs.existsSync(name)) { // 判断是否已经存在相应的项目名
    const answers = await inquirer.prompt([
      {
        name: "name",
        message: `请输入项目名称`,
        default: name
      },
      {
        name: "description",
        message: `请输入项目描述`,
      },
      {
        name: 'version',
        message: '项目的版本号',
        default: '1.0.0'
      },
      {
        name: "author",
        message: "请输入作者名称",
      },
    ]) // 用户交互的相应问题
    const confirm = await inquirer.prompt([ // 确认是否创建
      {
        type: 'confirm',
        message: '确认创建？',
        default: 'Y',
        name: 'isConfirm'
      }
    ])
    if (confirm.isConfirm) {
      const spinner = ora({
        text: "正在下载模板...",
        spinner: "bouncingBar"
      });
      spinner.start(); // 加载展示相应动画与文案
      download("direct:https://github.com/Andraw-lin/common-h5.git#common-h5", name, { clone: true }, err => { // 拉取相应的github模板，使用https时必须使用direct关键字
        if (err) {
          spinner.fail();
          console.log(symbols.error, chalk.red(err));
        } else {
          spinner.stopAndPersist({
            text: chalk.green('项目初始化完成'),
            prefixText: '🐶'
          });
          const fileName = `${name}/package.json`;
          const meta = {
            name,
            description: answers.description,
            version: answers.version,
            author: answers.author,
          };
          if (fs.existsSync(fileName)) { // 在现有的package.json文件中进行补充动态内容
            const content = fs.readFileSync(fileName).toString();
            const result = handlebars.compile(content)(meta);
            fs.writeFileSync(fileName, result);
          }
          const installSpinner = ora({
            text: chalk.yellow('正在安装依赖...')
          })
          installSpinner.start()
          shell.cd(name)
          const installObj = shell.exec('cnpm install') // 自动执行cnpm install
          if (installObj.code !== 0) {
            console.log(symbols.warning, chalk.yellow('自动安装失败，请手动安装！'));
            installSpinner.fail(); // 安装失败
            shell.exit(1);
          }
          installSpinner.stopAndPersist({
            text: chalk.green("依赖安装成功"),
            prefixText: '🐢',
          })
          console.log(`\nThen, you just do this:\n\tcd ./${name}\n\tnpm run serve`);
        }
      })
    }
  } else { // 项目已存在，不再处理
    console.log(symbols.error, chalk.red("项目已存在"));
  }
};

module.exports = downloadFunc;
