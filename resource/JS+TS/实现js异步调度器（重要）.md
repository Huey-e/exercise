### 用JavaScript实现一个带并发限制的异步调度器，保证同时最多运行2个任务，完善代码

```JS
class Scheduler {
  constructor() {
    this._max = 2
  }
}

const timeout = (time) =>
  new Promise((resolve) => {
    setTimeout(resolve, time)
  })

const scheduler = new Scheduler()
const addTask = (time, order) => {
  scheduler.add(() => timeout(time)).then(console.log(order))
}

addTask(4000, 4)
addTask(2000, 2)
addTask(3000, 3)
addTask(900, 1)
```

解释原题目中的代码

* 1.Scheduler类是需要我们实现的一个调度类，它帮助我们管理添加的异步任务，做到并发限制
* 2.也就是比如说，以前我们执行异步任务，是直接在当前环境下执行Promise，而现在要把Promise任务添加到Scheduler中，让它帮助调度执行Promise，于是就有个addTask方法、
* 3.在addTask中，通过Scheduler的add方法，将异步任务扔进Scheduler中。往下看，add方法后面跟着.then，说明add应该返回一个Promise
* 4.因为add会返回Promise且直接.then执行异步任务，说明在add方法里帮我们判断了异步任务数量是否超出了限制，并告诉我们该执行哪个任务。
* 5.那么接下来的目的就很明确了，编写Scheduler类，最重要的就是add方法的试实现。



```JS
class Scheduler {
  constructor() {
    this._max = 2
    this.unwork = []
    this.working = []
  }

  add(asyncTask) {
    return new Promise((resolve) => {
      asyncTask.resolve = resolve
      if (this.working.length < this._max) {
        this.runTask(asyncTask)
      } else {
        this.unwork.push(asyncTask)
      }
    })
  }

  runTask(asyncTask) {
    this.working.push(asyncTask)
    asyncTask().then(() => {
      asyncTask.resolve() // asyncTask异步任务完成以后，再调用外层Promise的resolve以便add().then()的执行
      var index = this.working.indexOf(asyncTask)
      this.working.splice(index, 1) // 从正在进行的任务队列中删除
      if (this.unwork.length > 0) {
        this.runTask(this.unwork.shift())
      }
    })
  }
}

const timeout = (time) =>
  new Promise((resolve) => {
    setTimeout(resolve, time)
  })

const scheduler = new Scheduler()
const addTask = (time, order) => {
  scheduler.add(() => timeout(time)).then(() => console.log(order))
}

addTask(4000, 4)
addTask(2000, 2)
addTask(3000, 3)
addTask(900, 1)

```

add方法中最重要的就是根据是否超过异步任务数量做不同处理。
首先add方法return的Promise肯定不是直接扔进来的asyncTask，而是再一次Promise封装过的asyncTask，为什么呢？
```
return asyncTask以后，无法继续进行操作。因为等到异步任务asyncTask执行完以后，还要进行working数组中删除以及push还未执行的任务等操作
```
再一次Promise封装的主要目的就是，可以让asyncTask执行完以后，将后续操作继续完成，再进行任务的轮询。
所以add方法中的`asyncTask.resolve = resolve`就很重要，这就保证了等到asyncTask自己的异步任务完成以后，在进行外层Promise的resolve。这便做到了asyncTask完成后，再做任务的更替。

感觉这道题的核心思想就是通过Promise的嵌套来控制主Promise的执行
