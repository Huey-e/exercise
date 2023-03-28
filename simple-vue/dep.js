/**
 * @Description: 
 * @Author: Cong Haiyang
 * @Date: 2023-02-02 11:23:28
 */

let depId = 0;

class Dep {
  constructor() {
    this.id = depId++;
    this.subs = []; // 存储与当前dep关联的 watcher
  }
  // 添加一个watcher
  addSub (sub) {
    this.subs.push(sub);
  }
  // 移除一个watcher
  removeSub (sub) {
    for (let i = this.subs.length - 1; i >= 0; i--) {
      if (sub === this.subs[i]) {
        this.subs.splice(i, 1);
      }
    }
  }

  // 将当前 Dep 与当前的 watcher 关联   依赖收集
  depend () {
    // 就是将 当前的 dep 与当前的 watcher 互相关联
    console.log('---1--',Dep.target);
    if (Dep.target) {
      this.addSub(Dep.target); // 将 当前的 watcher 关联到 当前的 dep 上
      Dep.target.addDep(this); // 将当前的 dep 与 当前渲染 watcher 关联起来
    }
    console.log('---依赖收集全局watcher（Dep.target）---', Dep.target);
    console.log('---依赖收集watcher（this.subs）---',  this.subs);
  }

  // 触发 关联的 watcher ，触发 watcher中的 updat方法 更新
  notify () {
    // 在真实的 Vue 中是依次触发 this.subs 中的 watcher 的 update 方法
    // 此时, deps 中已经关联到 我们需要使用的 那个 watcher 了
    let deps = this.subs.slice();
    deps.forEach(watcher => {
      watcher.update();
    });

  }
}

// 全局容器  存储渲染 watcher
Dep.target = null;

let targetStack = []; // 全局watcher数组

/** 将当前操作的 watcher 存储到 全局 watcher 中, 参数 target 就是当前 watcher */
function pushTarget (target) {
  console.log('---2---',Dep.target);
  targetStack.unshift(target);  // 向头部添加第一个元素  返回数组的长度
  Dep.target = target;
  console.log('---5---',targetStack);
}
/** 将 当前 watcher 踢出 */
function popTarget () {
  Dep.target = targetStack.shift(); // 删除第一个元素 并返回删除的值
  console.log('--3--',Dep.target) ;
}

/**
 * 在 watcher 调用 get 方法的时候, 调用 pushTarget( this )
 * 在 watcher 的 get 方法结束的时候, 调用 popTarget()
 */