const webpackChain = new (require('webpack-chain'))()
const { relativeToCwd, relativeToSrc } = require('./../helper/path')

webpackChain // 定义系统入口以及出口
  .mode('production')
  .entry('app')
  .add(relativeToCwd('app.js'))
  .end()
  .output
  .path(relativeToCwd('dist'))
  .filename('[name].bundle.js');

webpackChain.resolve.alias
  .set('vue$', 'vue/dist/vue.esm.js')

webpackChain.module // 解析app.js
  .rule('app')
  .resource(relativeToCwd('app.js'))
  .use('parse-app-init')
  .loader(relativeToSrc('./loaders/parse-app-init.js'))

webpackChain.module
  .rule('compile')
  .test(/\.js$/)
  .exclude
    .add(/node_modules/)
    .add(/dist/)
    .end()
  .use("babel-loader")
  .loader("babel-loader")
  .options({})
  .end()
  .use('parse-pages-init')
  .loader(relativeToSrc('./loaders/parse-page-init.js'))

webpackChain.module // 解析vue
  .rule('vue')
  .test(/\.vue$/)
  .use('vue-loader')
  .loader('vue-loader')

webpackChain.module
  .rule("style")
  .test(/\.css$/)
  .use("mini-css-extract-plugin")
  .loader(require("mini-css-extract-plugin").loader)
  .options({})
  .end()
  .use("css-loader")
  .loader("css-loader");

webpackChain.module
  .rule('image')
  .test(/\.(png|svg|jpg|gif)$/)
  .use('file-loader')
  .loader('file-loader')
  .options({ name:'img/[name].[hash:4].[ext]' });

webpackChain // 定义插件
  .plugin("html-webpack-plugin")
  .use(require("html-webpack-plugin"), [
    {
      filename: "index.html",
      template: relativeToCwd("./public/index.html")
    }
  ])
  .end()
  .plugin("vue-loader/lib/plugin")
  .use(require('vue-loader/lib/plugin'))
  .end()
  .plugin("mini-css-extract-plugin")
  .use(require("mini-css-extract-plugin"), [{ filename: "app.css" }]);

module.exports = webpackChain.toConfig()