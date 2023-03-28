/**
 * @Description: 函数柯里化：什么叫函数柯里化？其实就是将使用多个参数的函数转换成一系列使用一个参数的函数的技术。还不懂？来举个例子。
 * @Author: Cong Haiyang
 * @Date: 2023-02-07 10:01:52
 */

function add(a, b, c) {
    return a + b + c
}

function curry(fn) {
    let judge = (...args) => {
        if (args.length == fn.length) return fn(...args)
        return (...arg) => judge(...args, ...arg)
    }
    return judge
}


add(1, 2, 3)
let addCurry = curry(add)
console.log(addCurry(1)(2)(3));

// ------------------------------------------------------------------------------------------------------------------------

//解析：
// -这里的fn.length 获取的是函数传入参数的长度
// -这里使用递归的思想

// function myCurried(fn){
//   return function curry(...args1){
//       console.log('--函数传入参数的长度--', fn.length);
//     if(args1.length >= fn.length){

//       return fn.call(null, ...args1)

//     }else{

//       return function (...args2){

//         return curry.apply(null, [...args1, ...args2])

//       }
//     }
//   }
// }

function myCurried(fn){
  return function curry(...args1){
     if(args1.length >=  fn.length){
        return fn.call(null, ...args1)
     }else{
      return function (...args2) {
         return curry.apply(null, [...args1, ...args2])
      }
     }
  }
}

function sum(a, b, c, d, e) {
  return a + b + c + d + e
}

let resFunc = myCurried(sum)

console.log(resFunc(1,3,4)(1)(23))