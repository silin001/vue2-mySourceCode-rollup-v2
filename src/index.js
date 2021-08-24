// vue核心 只是vue的一个声明文件
import { initMixin } from './init'


function Vue (options) {
  //vue 初始化操作
  this._init(options)
}
// 通过引入文件方式给vue原型添加方法
initMixin(Vue) // 给vue原型添加_init方法
export default Vue