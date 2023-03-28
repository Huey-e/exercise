/**
 * 什么是偏函数？偏函数就是将一个 n 参的函数转换成固定 x 参的函数，剩余参数（n - x）将在下次调用全部传入。举个例子：
 * 
 */

function add(a, b, c) {
    return a + b + c
}
let partialAdd = partial(add, 1)
partialAdd(2, 3)
console.log(partialAdd(2, 3));

function partial(fn, ...args1){
  return function (...arg){
    return fn.apply(null, [...arg, ...args1])
  }
}

// 占位

function clg(a, b, c) {
    console.log(a, b, c)
}

let partialClg = partial(clg, '_', 2)
// partialClg(1, 3)  // 依次打印：1, 2, 3

function partial (fn, ...args){
  return function(...arg){  // 1, 3
     for (let i = 0; i < args.length; i++) {
      if(args[i] === '_'){
        args[i] = arg[0]
        arg.shift()
      }
     }
     return fn.apply(null, [...args, ...arg])
  }
}
partialClg(1, 3)