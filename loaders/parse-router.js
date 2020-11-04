const jsonLoader = require('json-loader')
const esprima = require('esprima')
const estraverse = require('estraverse')
const loaderUtils = require('loader-utils')
const { Node } = require('./../helper/types.js')

const parseRouter = appConfig => {
  const appJson = jsonLoader(appConfig)
  const program = esprima.parseModule(appJson)
  estraverse.traverse(program, { // 遍历app.json相应的AST，并且标记首页
    enter: (node, parent) => {
      if (
        parent &&
        parent.type === 'AssignmentExpression' &&
        node.type === 'ObjectExpression'
      ) {
        const pagesAst = node.properties.filter(prop => prop.key.value === 'pages')
        const pagesConfig = pagesAst[pagesAst.length - 1]
        pagesConfig.value.elements.forEach((page, index) => {
          page._isPage = true
          page._isFirstPage = !index
          return page
        })
      }   
    }
  })
  
  return {
    routerConfig: handleRouter(program),
    routerNavigationGuard: handleNavigationGuard(appConfig)
  }
}

const handleRouter = program => {
  let pageRouterConfig
  estraverse.replace(program, {
    enter: (node, parent) => {
      if (node._isPage) { // 根据上述的标记找出相应的页面AST
        const componentPath = `${loaderUtils.urlToRequest(node.value)}.js`
        if (node._isFirstPage) {
          parent.elements.push(Node('ObjectExpression')([
            Node('Property')(Node('Identifier')('path'), Node('Literal')('/')),
            Node('Property')(Node('Identifier')('redirect'), Node('Literal')(`/${node.value}`))
          ]))
          pageRouterConfig = parent
        }
        node = Node('ObjectExpression')([
          Node('Property')(Node('Identifier')('path'), Node('Literal')(`/${node.value}`)),
          Node('Property')(
            Node('Identifier')('component'),
            Node('MemberExpression')(
              Node('CallExpression')(
                Node('Identifier')('require'),
                [Node('Literal')(componentPath)]
              ),
              Node('Identifier')('default'),
            )
          )
        ])
      }
      return node
    }
  })
  return pageRouterConfig
}
const handleNavigationGuard = appConfig => {
  const { window: { navigationBarTextStyle, backgroundColor, navigationBarTitleText } } = appConfig
  const navigationGuardsAst = esprima.parseModule(`
    router.beforeEach((to, from, next) => {
      console.log('导航守卫前置设置中...');
      next();
    });
    router.afterEach(to => {
      console.log('导航守卫后置设置中...');
    });
  `)
  estraverse.traverse(navigationGuardsAst, {
    enter: (node, parent) => {
      if (
        node.type === 'ExpressionStatement' &&
        node.expression &&
        node.expression.callee &&
        node.expression.callee.type === 'Identifier' &&
        node.expression.callee.name === 'next'
      ) {
        parent.body.unshift(setAppConfig('setNavigationBarTitle', 'title', navigationBarTitleText || '标题'))
        parent.body.unshift(setAppConfig('setBackgroundTextStyle', 'textStyle', navigationBarTextStyle || '#ffffff'))
        parent.body.unshift(setAppConfig('setBackgroundColor', 'backgroundColor', backgroundColor || '#ffffff'))
      }
    }
  })
  return navigationGuardsAst
}
const setAppConfig = function(method, property, value) { // 设置默认配置项
  return Node('ExpressionStatement')(
    Node('CallExpression')(
      Node('MemberExpression')(
        Node('Identifier')('mywx'),
        Node('Identifier')(method)
      ),
      [Node('ObjectExpression')([
        Node('Property')(
          Node('Identifier')(property),
          Node('Literal')(value)
        )
      ])]
    )
  )
}

module.exports = parseRouter