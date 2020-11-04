const fs = require('fs')
const esprima = require('esprima')
const estraverse = require('estraverse')
const escodegen = require('escodegen')
const { relativeToCwd } = require('./path.js')
const { Node } = require('./types.js')

const vueBuilder = (template, script, style) => {
  return `
    <template src="${template}"></template>
    <script>${ script }</script>
    <style src="${style}" scoped></style>
  `
}
const createVue = (script, { routerConfig, routerNavigationGuard }, vuexConfig, anotherCodeAst) => { // 入口文件使用new Vue创建实例
  const template = esprima.parseModule(`{
    template: '<div class="container"><router-view></router-view></div>'
  }`)
  const routerAst = esprima.parseModule('{router}')
  const vuexAst = vuexConfig && esprima.parseModule('{store: new Vuex.Store(store)}')
  const resultAst = Node('ExpressionStatement')(
    Node('CallExpression')(
      Node('MemberExpression')(
        Node('Identifier')('Object'),
        Node('Identifier')('assign')
      ),
      [template, script, routerAst, vuexAst].filter(item => item)
    )
  )
  const globalGetApp = getAppConfig(script)
  const globalStyle = fs.existsSync(relativeToCwd('app.css')) ? 'import "./app.css";' : ''
  const result = `
    import Vue from 'vue';
    import VueRouter from 'vue-router';
    ${anotherCodeAst.length && anotherCodeAst.map(code => escodegen.generate(code)).join('')}
    ${vuexConfig}
    ${globalStyle}
    ${escodegen.generate(globalGetApp)}
    Vue.use(VueRouter);
    const routes = ${escodegen.generate(routerConfig)}
    const router = new VueRouter({ routes });
    ${escodegen.generate(routerNavigationGuard)}
    const options = ${ escodegen.generate(resultAst, {format: {semicolons: false}}) }
    new Vue(options).$mount('#app');
  `
  return result
}
const queryOkLifecycle = astObj => { // 查询OK的生命周期
  const { properties } = astObj[0]
  const okLifecycle = []
  const newProperties = []
  let beforeCreateAst
  properties.forEach(property => {
    if (property.key.name === 'beforeCreate') {
      beforeCreateAst = property
      return
    }
    ['onLoad', 'onShow', 'onHide', 'onUnload'].find(name => name === property.key.name) ? okLifecycle.push(property) : newProperties.push(property)
  })
  const result = okLifecycle.map(lifecycle => ( // 组装ok生命周期
    Node('ExpressionStatement')(
      Node('CallExpression')(
        Node('MemberExpression')(
          Node('Identifier')('mywx'),
          Node('Identifier')(lifecycle.key.name)
        ),
        [lifecycle.value]
      )
    )
  ))
  if (!beforeCreateAst) {
    beforeCreateAst = Node('Property')(
      Node('Identifier')('beforeCreate'),
      Node('FunctionExpression')(result, [])
    )
  } else {
    beforeCreateAst.value.body.body = beforeCreateAst.value.body.body.concat(result)
  }
  newProperties.push(beforeCreateAst)
  const resultAst = Node('ObjectExpression')(newProperties)  
  return resultAst
}
const exportsBuilder = astObj => Node('ExportDefaultDeclaration')(astObj) // 增加export default语句
const vuexImport = ({store}) => `
  import Vuex from 'vuex';
  import store from '${store}';
  Vue.use(Vuex);
`
const getAppConfig = script => {
  const getAppTemplate = esprima.parseModule(`
    window.getApp = (function() {
      const _app = null
      return function() {
        return _app
      }
    })()
  `)
  estraverse.replace(getAppTemplate, {
    enter: node => {
      if (
        node.type === 'Literal' &&
        node.value === null
      ) {
        return script
      }
    }
  })
  return getAppTemplate
}

module.exports = {
  vueBuilder,
  createVue,
  queryOkLifecycle,
  exportsBuilder,
  vuexImport
}