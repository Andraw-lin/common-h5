#!/usr/bin/env node
// 用于告诉系统使用/usr/bin下的node来解释当前文件

const program = require('commander'); // 用于动态识别用户输入命令
const figlet = require('figlet'); // 用于展示好看的输出图案

program
  .version('1.0.0', '-v, --version')
  .command('create <type> [name] [otherParams]') // 定义用户创建项目的命令
  .alias('cli')
  .description('Generates new code')
  .action(function (type, name, otherParams) {
    figlet.text('CH5-CLI', {
      horizontalLayout: 'fitted'
    }, (err, data) => {
      console.log(data); // 展示输出图案
      switch(type) {
        case 'download':
          const downloadFunc = require('./download.js');
          downloadFunc(name);
          break;
        // case 'create':
        //   const createFunc = require('./create.js');
        //   createFunc(name, otherParams);
        //   break;
        default: return false;
      }
    })
  });

program.parse(process.argv);