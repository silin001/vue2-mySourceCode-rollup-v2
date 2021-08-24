// 对象的数据劫持！
// 把data中的对象数据使用Object.defineProperty 重新定义， es5方法
// 该方法不兼容ie8 及以下， vue2 无法兼容ie8
import { isObject, def } from '../utils/index'
import { arrayMethods } from './array'
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
    // BUG 这样写会死循环
    // value.__ob__ = this // ⭐ 这里给每一个监控过的对象新增一个__ob__ 属性，在数组方法重写时需要用到
    // 使用Object.defineProperty 方法去添加
    def(value, '__ob__', this)
    if (Array.isArray(value)) {
      // 如果是数组的话并不会对索引进行观测，因为会导致性能问题
      // 前端开发中很少操作索引，  push unshift unshift
      // 如果数组里放的是对象我在监控
      // console.log(arrayMethods)
      // 2.⭐ 用户可能使用 this.data.arr.push({}) ..等方法 所有要重写这些方法
      value.__proto__ = arrayMethods // 原型添加我们重写的数组方法
      this.observerArray(value) // 1.数组中每一项进行观测
    } else {
      this.walk(value) // 对象的进行观测

    }
  }
  observerArray (data) {
    for (let index = 0; index < data.length; index++) {
      observe(data[index])
    }
  }
  walk (data) {
    let keys = Object.keys(data) //获取data key值 [name,age,address]
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