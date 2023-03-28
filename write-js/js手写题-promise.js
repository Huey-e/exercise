const PENDING = 'pending';
const FULFILLED = 'fulfilled';
const REJECTED = 'rejected';

class Promise {
  constructor(executor) {
    this.status = PENDING;
    this.value = undefined;
    this.reason = undefined;
    this.onResolvedCallbacks = [];
    this.onRejectedCallbacks = [];

    let resolve = (value) => {
      if (this.status === PENDING) {
        this.status = FULFILLED;
        this.value = value;
        this.onResolvedCallbacks.forEach((fn) => fn());
      }
    };

    let reject = (reason) => {
      if (this.status === PENDING) {
        this.status = REJECTED;
        this.reason = reason;
        this.onRejectedCallbacks.forEach((fn) => fn());
      }
    };

    try {
      executor(resolve, reject);
    } catch (error) {
      reject(error);
    }
  }

  then (onFulfilled, onRejected) {
    // 解决 onFufilled，onRejected 没有传值的问题
    onFulfilled = typeof onFulfilled === "function" ? onFulfilled : (v) => v;
    // 因为错误的值要让后面访问到，所以这里也要抛出错误，不然会在之后 then 的 resolve 中捕获
    onRejected = typeof onRejected === "function" ? onRejected : (err) => {
      throw err;
    };
    // 每次调用 then 都返回一个新的 promise
    let promise2 = new Promise((resolve, reject) => {
      if (this.status === FULFILLED) {
        //Promise/A+ 2.2.4 --- setTimeout
        setTimeout(() => {
          try {
            let x = onFulfilled(this.value);
            // x可能是一个proimise
            resolvePromise(promise2, x, resolve, reject);
          } catch (e) {
            reject(e);
          }
        }, 0);
      }

      if (this.status === REJECTED) {
        //Promise/A+ 2.2.3
        setTimeout(() => {
          try {
            let x = onRejected(this.reason);
            resolvePromise(promise2, x, resolve, reject);
          } catch (e) {
            reject(e);
          }
        }, 0);
      }

      if (this.status === PENDING) {
        this.onResolvedCallbacks.push(() => {
          setTimeout(() => {
            try {
              let x = onFulfilled(this.value);
              resolvePromise(promise2, x, resolve, reject);
            } catch (e) {
              reject(e);
            }
          }, 0);
        });

        this.onRejectedCallbacks.push(() => {
          setTimeout(() => {
            try {
              let x = onRejected(this.reason);
              resolvePromise(promise2, x, resolve, reject);
            } catch (e) {
              reject(e);
            }
          }, 0);
        });
      }
    });

    return promise2;
  }
}
const resolvePromise = (promise2, x, resolve, reject) => {
  // 自己等待自己完成是错误的实现，用一个类型错误，结束掉 promise  Promise/A+ 2.3.1
  if (promise2 === x) {
    return reject(
      new TypeError("Chaining cycle detected for promise #<Promise>"));
  }
  // Promise/A+ 2.3.3.3.3 只能调用一次
  let called;
  // 后续的条件要严格判断 保证代码能和别的库一起使用
  if ((typeof x === "object" && x != null) || typeof x === "function") {
    try {
      // 为了判断 resolve 过的就不用再 reject 了（比如 reject 和 resolve 同时调用的时候）  Promise/A+ 2.3.3.1
      let then = x.then;
      if (typeof then === "function") {
        // 不要写成 x.then，直接 then.call 就可以了 因为 x.then 会再次取值，Object.defineProperty  Promise/A+ 2.3.3.3
        then.call(
          x, (y) => {
            // 根据 promise 的状态决定是成功还是失败
            if (called) return;
            called = true;
            // 递归解析的过程（因为可能 promise 中还有 promise） Promise/A+ 2.3.3.3.1
            resolvePromise(promise2, y, resolve, reject);
          }, (r) => {
            // 只要失败就失败 Promise/A+ 2.3.3.3.2
            if (called) return;
            called = true;
            reject(r);
          });
      } else {
        // 如果 x.then 是个普通值就直接返回 resolve 作为结果  Promise/A+ 2.3.3.4
        resolve(x);
      }
    } catch (e) {
      // Promise/A+ 2.3.3.2
      if (called) return;
      called = true;
      reject(e);
    }
  } else {
    // 如果 x 是个普通值就直接返回 resolve 作为结果  Promise/A+ 2.3.4
    resolve(x);
  }
};


Promise.defer = Promise.deferred = function () {
    let dfd = {}
    dfd.promise = new Promise((resolve,reject)=>{
        dfd.resolve = resolve;
        dfd.reject = reject;
    });
    return dfd;
}
module.exports = Promise;


/******* 
 * @description: Promsie.resolve(value) 可以将任何值转成值为 value 状态是 fulfilled 的 Promise，但如果传入的值本身是 Promise 则会原样返回它。
 * @param {*} value
 * @return {*}
 */
Promise.resolve = function(value) {
    // 如果是 Promsie，则直接输出它
    if(value instanceof Promise){
        return value
    }
    return new Promise(resolve => resolve(value))
}

/******* 和 Promise.resolve() 类似，Promise.reject() 会实例化一个 rejected 状态的 Promise。
 * 但与 Promise.resolve() 不同的是，如果给 Promise.reject() 传递一个 Promise 对象，则这个对象会成为新 Promise 的值。
 * @description: 
 * @param {*} reason
 * @return {*}
 */
Promise.reject = function(reason) {
    return new Promise((resolve, reject) => reject(reason))
}


/******* 
 * @description: Promise.all 的规则是这样的：
 * -传入的所有 Promsie 都是 fulfilled，则返回由他们的值组成的，状态为 fulfilled 的新 Promise；
 * -只要有一个 Promise 是 rejected，则返回 rejected 状态的新 Promsie，且它的值是第一个 rejected 的 Promise 的值；
 * -只要有一个 Promise 是 pending，则返回一个 pending 状态的新 Promise；
 * @return {*}
 */

Promise.all = function(promiseArr) {
    let index = 0, result = []
    return new Promise((resolve, reject) => {
        promiseArr.forEach((p, i) => {
            Promise.resolve(p).then(val => {
                index++
                result[i] = val
                if (index === promiseArr.length) {
                    resolve(result)
                }
            }, err => {
                reject(err)
            })
        })
    })
}


/******* 
 * @description: Promise.race 会返回一个由所有可迭代实例中第一个 fulfilled 或 rejected 的实例包装后的新实例。
 * @return {*}
 */
Promise.race = function(promiseArr) {
    return new Promise((resolve, reject) => {
        promiseArr.forEach(p => {
            Promise.resolve(p).then(val => {
                resolve(val)
            }, err => {
                rejecte(err)
            })
        })
    })
}


/******* 
 * @description: Promise.allSettled 的规则是这样：
 * -所有 Promise 的状态都变化了，那么新返回一个状态是 fulfilled 的 Promise，且它的值是一个数组，数组的每项由所有 Promise 的值和状态组成的对象；
 * -如果有一个是 pending 的 Promise，则返回一个状态是 pending 的新实例；
 * @return {*}
 */
Promise.allSettled = function(promiseArr) {
    let result = []
        
    return new Promise((resolve, reject) => {
        promiseArr.forEach((p, i) => {
            Promise.resolve(p).then(val => {
                result.push({
                    status: 'fulfilled',
                    value: val
                })
                if (result.length === promiseArr.length) {
                    resolve(result) 
                }
            }, err => {
                result.push({
                    status: 'rejected',
                    reason: err
                })
                if (result.length === promiseArr.length) {
                    resolve(result) 
                }
            })
        })  
    })   
}


/******* 
 * @description: Promise.any 的规则是这样：
 * -空数组或者所有 Promise 都是 rejected，则返回状态是 rejected 的新 Promsie，且值为 AggregateError 的错误；
 * -只要有一个是 fulfilled 状态的，则返回第一个是 fulfilled 的新实例；
 * -其他情况都会返回一个 pending 的新实例；
 * @return {*}
 */
Promise.any = function(promiseArr) {
    let index = 0
    return new Promise((resolve, reject) => {
        if (promiseArr.length === 0) return 
        promiseArr.forEach((p, i) => {
            Promise.resolve(p).then(val => {
                resolve(val)
                
            }, err => {
                index++
                if (index === promiseArr.length) {
                  reject(new AggregateError('All promises were rejected'))
                }
            })
        })
    })
}