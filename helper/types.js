exports.Identifier = function (name) {
  return { type: 'Identifier', name }
}
exports.ExportDefaultDeclaration = function (declaration) {
  return { type: 'ExportDefaultDeclaration', declaration }
}
exports.ExpressionStatement = function (expression) {
  return { type: 'ExpressionStatement', expression }
}
exports.CallExpression = function (callee, args) {
  return { type: 'CallExpression', callee, arguments: args }
}
exports.MemberExpression = function (object, property) {
  return { type: 'MemberExpression', computed: false, object, property }
}
exports.Property = function (key, value) {
  return { type: 'Property', key, computed: false, value }
}
exports.BlockStatement = function (body) {
  return { type: 'BlockStatement', body }
} 
exports.FunctionExpression = function (body, args) {
  return { type: 'FunctionExpression', params: args, body: new exports['BlockStatement'](body) }
}
exports.ObjectExpression = function (properties) {
  return { type: 'ObjectExpression', properties }
}
exports.Literal = function (value) {
  return { type: 'Literal', value, raw: `'${value}'` }
}
exports.Node = type => (...args) => new (exports[type])(...args) // 创建不同类型的节点