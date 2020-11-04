const fs = require('fs')
const esprima = require('esprima')
const estraverse = require('estraverse')
const parseRouter = require('./parse-router')

const { relativeToCwd } = require('./../helper/path.js')
const { createVue, queryOkLifecycle, vuexImport } = require('./../helper/model.js')
const APP_CONFIG = 'app.json'

const parseAppInit = source => {
  const { cacheable, addDependency } = this
  cacheable && cacheable() // 解析结果若有缓存，则直接从缓存中获取
  const appJsonPath = relativeToCwd(APP_CONFIG)
  addDependency && addDependency(appJsonPath)
  
  const appConfig = fs.readFileSync(appJsonPath, 'utf-8') // 读取app.json文件配置
  const appConfigParse = JSON.parse(appConfig)
  const program = esprima.parseModule(source) // 先解析app.js中模块
  const appInstanceAst = []
  const anotherCodeAst = []
  estraverse.traverse(program, { // 遍历AST，并找到App的位置
    enter: (node, parent) => {
      if (parent && parent.type === 'Program') {
        if (
          node.type === 'ExpressionStatement'
          && node.expression.callee
          && node.expression.callee.name === 'App'
        ) {
          // return Node(ExportDefaultDeclaration, node.expression.arguments[0])
          appInstanceAst.push(node.expression.arguments[0])
        } else {
          anotherCodeAst.push(node)
        }
      }
    }
  })
  const script = queryOkLifecycle(appInstanceAst)
  // 分析app.json，配置相应的vue-router
  const routerGroup = parseRouter(appConfigParse)
  const vuexConfig = appConfigParse.store ? vuexImport(appConfigParse) : ''
  const result = createVue(script, routerGroup, vuexConfig, anotherCodeAst)
  return result
}

module.exports = parseAppInit