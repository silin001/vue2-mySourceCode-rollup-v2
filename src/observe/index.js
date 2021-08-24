// 对象的数据劫持！
// 把data中的对象数据使用Object.defineProperty 重新定义， es5方法
// 该方法不兼容ie8 及以下， vue2 无法兼容ie8
import { isObject } from '../utils/index'

// ⭐定义响应式数据
function defineReactive (data, key, value) {
  observe(value) //⭐ 递归实现深度监测，层次越深越差
  Object.defineProperty(data, key, {
    get () {
      return value
    },
    set (newVal) {
      if (newVal === value) return
      console.log('值改变了')
      observe(newVal)       // ⭐继续劫持用户设置的值，因为有可以用户设置的值为{}
      value = newVal
    }
  })
}
// 观察数据 类
class Observer {
  constructor(value) {
    // vue如果数据的层次过多 需要递归去解析对象中的属性,依次添加get, set方法
    this.walk(value)
  }
  walk (data) {
    let keys = Object.keys(data) //获取data key值 [name,age,address]
    console.log('🚀🚀 ~ file: index.js ~ line 11 ~ Observer ~ walk ~ keys', keys)
    keys.forEach((key) => {
      defineReactive(data, key, data[key]) // 定义响应式数据
    })
    // for (let index = 0; index < keys.length; index++) {
    //   const key = keys[index]
    //   const value = data[key]
    // defineReactive(data, key, value]) // 定义响应式数据
    // }
  }
}


export function observe (data) {
  console.log(data, 'observe')
  const isObj = isObject(data)
  if (!isObj) return
  return new Observer(data)  // 用来观测数据
}