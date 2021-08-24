import babel from 'rollup-plugin-babel'
import serve from 'rollup-plugin-serve'
export default {
  input: './src/index.js', // 打包入口文件
  output: {
    file: 'dist/umd/vue.js',// 出口路径
    name: 'Vue', // 指定打包后全局遍变量名称
    format: 'umd', // 统一模块规范
    sourcemap: true, //开启源码调试 可以找到源码位置
  },
  plugin: [
    babel({
      exclude: 'node_modules/**'
    }),
    process.env.ENV === 'development' ? serve({
      open: true,
      openPage: '/public/index.html', // 默认打开html路径
      port: 3100,
      host: 'localhost',
      contentBase: ''
    }) : null
  ]
}