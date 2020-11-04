#!/usr/bin/env node
const program = require('commander');
const webpack = require('webpack');
const webpackConfig = require('./config/build');

program
  .command('build')
  .description('A miniprogram structure is building...')
  .action(function() {
    // build();
    const compiler = webpack(webpackConfig);
    compiler.run((err, stats) => {
      if (err || stats.hasErrors()) {
        console.log(stats.toJson().errors);
      }
    });
  })

program.parse(process.argv)