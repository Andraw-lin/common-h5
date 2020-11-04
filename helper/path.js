const path = require('path')

const getCwd = () => process.cwd() // 获取当前项目录的绝对路径
const relativeToSrc = name => path.join(__dirname, '../', name) // 获取相对于当前目录的相对路径
const relativeToCwd = name => path.join(getCwd(), './', name) // 获取相对于当前目录的绝对路径

module.exports = {
  relativeToSrc,
  relativeToCwd
}