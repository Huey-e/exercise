/**
 * @Description:  将 data 进行响应式转换，进行代理
 * @Author: Cong Haiyang
 * @Date: 2023-02-02 11:22:48
 */

// 将数组的一些基本方法 转响应式
let ARRAY_METHOD = [
  'push',
  'pop',
  'shift',
  'unshift',
  'reverse',
  'sort',
  'splice',
];

let array_methods = Object.create(Array.prototype)

ARRAY_METHOD.forEach(method => {
  array_methods[method] = function () {
    // 调用原来的方法
    console.log('调用的是拦截的 ' + method + ' 方法');

    // 将数据进行响应式化
    for (let i = 0; i < arguments.length; i++) {
      observe(arguments[i])
    }

    let res = Array.prototype[method].apply(this, arguments)
    return res;
  }
})


// 简化版本
function defineReactive (target, key, value, enumerable) {
  // 函数内部就是一个局部作用域, 这个 value 就只在函数内使用的变量 ( 闭包 )
  if (typeof value === 'object' && value != null) {
    // 是非数组的引用类型
    observe(value); // 递归
  }

  let dep = new Dep();  // 一个参数一个dep
  dep.__protoName__ = key;
  Object.defineProperty(target, key, {
    configurable: true,
    enumerable: !!enumerable,
    get () {
      // console.log(`读取 ${key} 属性`); // 额外
      // 依赖收集 ( 暂时略 )
      console.log('---------------------------4----------------------------');
      dep.depend();
      return value;
    },
    set (newVal) {

      if (value === newVal) return;

      // 需要将重新赋值的数据 在变成响应式 ，所以还需要在调用observe
      if (typeof newVal === 'object' && newVal != null) {
        observe(newVal)
      }
      value = newVal;
      // 派发更新, 找到全局的 watcher, 调用 update
      dep.notify();
    }
  })
}

/** 将 某一个对象的属性 访问 映射到 对象的某一个属性成员上 */
function proxy (target, prop, key) {
  Object.defineProperty(target, key, {
    enumerable: true,
    configurable: true,
    get () {
      return target[prop][key]
    },
    set (newVal) {
      target[prop][key] = newVal;
    }
  })
}


/** 将对象 o 变成响应式, vm 就是 vue 实例, 为了在调用时处理上下文 */
function observe (obj) {
  // 如果是数组 就需要递归 进行响应式
  if (Array.isArray(obj)) {
    for (let i = 0; i < obj.length; i++) {
      observe(obj[i])  // 递归处理每一个数组元素
    }
  } else {
    let keys = Object.keys(obj);
    for (let i = 0; i < keys.length; i++) {
      let prop = keys[i];
      defineReactive(obj, prop, obj[prop], true)
    }
  }
}


CVue.prototype.initData = function () {
  // 遍历 this._data 的成员, 将 属性转换为响应式 ( 上 ), 将 直接属性, 代理到 实例上
  let keys = Object.keys(this._data);

  // 响应式化
  observe(this._data)

  // 代理  使用
  // 将 this._data[ keys[ i ] ] 映射到 this[ keys[ i ] ] 上
  // 就是要 让 this 提供 keys[ i ] 这个属性
  // 在访问这个属性的时候 相当于在 访文this._data 的这个属性
  for (let i = 0; i < keys.length; i++) {
    proxy(this, '_data', keys[i]);
  }
}