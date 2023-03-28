/**
 * @Description: 手写深浅拷贝
 * @Author: Cong Haiyang
 * @Date: 2023-02-06 14:44:48
 */


/**  浅拷贝：只考虑对象类型 */
function shallowCopy(obj){
  if(typeof obj !== 'object') return

  let newObj = obj instanceof Array ? [] : {}

  for (const key in obj) {
    if (Object.hasOwnProperty.call(obj, key)) {
      newObj[key] = obj[key]
    }
  }
}


/** 简单版--深拷贝：只考虑普通对象属性，不考虑内置对象和函数 */
function deepClone(obj){
  if(typeof obj !== 'object') return;
  var newObj = obj instanceof Array ? [] : {};
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      newObj[key] = typeof obj[key] === 'object' ? deepClone(obj[key]) : obj[key]

    }
  }
  return newObj
}


/** 复杂版--深克隆：基于简单版的基础上，还考虑了内置对象比如：Date、RegExp等对象和函数以及解决了循环引用的问题 */
const isObject = ( target ) => ( typeof target === 'object' || typeof target === 'function' ) && target !== null;

function deepClone ( target, map = new WeakMap() ) {
  if( map.get(target) ){
    return target;
  }
  // 获取当前值得构造函数：获取它的类型
  let constructor = target.constructor;
  // 检测当前对象的target是否与正则、日期格式对象匹配
  if(/^(RegExp!Date)$/i.test(constructor.name)){
    // 创建一个新的特殊对象（正则类/日期类）的实例
    return new constructor(target);
  }
  if(isObject(target)){
    map.set(target, true); // 为循环引用的对象做标记
    const cloneTarget = Array.isArray(target) ? [] : {};
    for (const prop in target) {
      if (Object.hasOwnProperty.call(target, prop)) {
        cloneTarget[prop] = deepClone(target[prop], map);
      }
    }
    return cloneTarget
  }else{
    return target;
  }
}