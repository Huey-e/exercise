/**
 * @Description: call
 * @Author: Cong Haiyang
 * @Date: 2023-02-09 10:16:00
 */

/**
 * 
 * -使用一个指定的 this 值和一个或多个参数来调用一个函数。
 * -实现要点：
 * --this可能传入null
 * --传入不固定个数的参数
 * --函数可能有返回值
 * 
 */

Function.prototype.call2 = function (context) {

}
class MyPromise {
  constructor(executor) {
    this.state = "pending";
    this.value = undefined;
    this.reason = undefined;
    this.onResolvedCallbacks = [];
    this.onRejectedCallbacks = [];

    let resolve = value => {
      if (this.state === "pending") {
        this.state = "fulfilled";
        this.value = value;
        this.onResolvedCallbacks.forEach(cb => cb());
      }
    };

    let reject = reason => {
      if (this.state === "pending") {
        this.state = "rejected";
        this.reason = reason;
        this.onRejectedCallbacks.forEach(cb => cb());
      }
    };

    try {
      executor(resolve, reject);
    } catch (e) {
      reject(e);
    }
  }

  then (onFulfilled, onRejected) {
    onFulfilled = typeof onFulfilled === "function" ? onFulfilled : value => value;
    onRejected =
      typeof onRejected === "function"
        ? onRejected
        : reason => {
          throw reason;
        };
    let promise2 = new MyPromise((resolve, reject) => {
      if (this.state === "fulfilled") {
        setTimeout(() => {
          try {
            let x = onFulfilled(this.value);
            resolvePromise(promise2, x, resolve, reject);
          } catch (e) {
            reject(e);
          }
        }, 0);
      }
      if (this.state === "rejected") {
        setTimeout(() => {
          try {
            let x = onRejected(this.reason);
            resolvePromise(promise2, x, resolve, reject);
          } catch (e) {
            reject(e);
          }
        }, 0);
      }
      if (this.state === "pending") {
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

function resolvePromise (promise2, x, resolve, reject) {
  if (x === promise2) {
    return reject(new TypeError("Chaining cycle detected for promise"));
  }
  let called = false;
  if (x !== null
  ) { }
}
