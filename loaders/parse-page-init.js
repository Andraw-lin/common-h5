const fs = require('fs')
const path = require('path')
const esprima = require('esprima')
const estraverse = require('estraverse')
const escodegen = require('escodegen')
const { urlToRequest } = require('loader-utils')
const vueLoader = require('vue-loader')
const { relativeToCwd } = require('./../helper/path.js')
const { exportsBuilder, vueBuilder, queryOkLifecycle } = require('./../helper/model.js')
const APP_CONFIG = 'app.json'

const parsePagesInit = function(source) {
  const { cacheable, addDependency, resourcePath } = this
  cacheable && cacheable() // 解析结果若有缓存，则直接从缓存中获取
  const appJsonPath = relativeToCwd(APP_CONFIG)
  addDependency && addDependency(appJsonPath)
  
  const { pages } = JSON.parse(fs.readFileSync(appJsonPath, 'utf-8').toString()) // 读取app.json文件配置
  const matchedPagePath = getMatchedPagePath(pages, resourcePath) // 匹配相应Pages中的页面出来
  if (matchedPagePath) {
    const program = esprima.parseModule(source)
    const pageGroup = findPageGroup(matchedPagePath)
    estraverse.replace(program, {
      enter: (node, parent) => {
        if (
          parent &&
          parent.type === 'Program' &&
          node.type === 'ExpressionStatement' &&
          node.expression.callee &&
          node.expression.callee.name === 'Page'
        ) {
          return exportsBuilder(node.expression.arguments[0])
        }
      }
    })
    const template = pageGroup.template ? urlToRequest(`./index.html`) : ''
    const script = pageGroup.script ? escodegen.generate(program) : ''
    const style = pageGroup.css ? urlToRequest(`./index.css`) : ''
    const result = `${vueLoader.call(this, vueBuilder(template, script, style))}`
    return result
  }
  return source
}
const getMatchedPagePath = (pages, resourcePath) => { // 判断是否Pages文件中页面
  pages = pages.filter(
    pagePath => 
      path.join(process.cwd(), `${pagePath}.js`) === resourcePath
  )
  return pages[0]
}
const findPageGroup = pagePath => { // 根据路径查询其他相关文件是否存在，如css文件、html文件、json文件
  const pageDetail = path.parse(pagePath)
  const pageDir = fs.readdirSync(pageDetail.dir)
  return {
    path: pagePath,
    template: pageDir.indexOf('index.html') > -1,
    script: pageDir.indexOf('index.js') > -1,
    css: pageDir.indexOf('index.css') > -1,
    json: pageDir.indexOf('index.json') > -1
  }
}

module.exports = parsePagesInit