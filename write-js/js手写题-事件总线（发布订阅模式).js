class EventEmitter {
  constructor () {
    this.eventObjs = {};
  }

  // 注册事件，可以连续注册，可以注册多个事件
  on(name, handler){

    (this.eventObjs[ name ] || ( this.eventObjs[ name ] = [] )).push(handler);

  }

  /** 移除事件, 
   * - 如果没有参数, 移除所有事件, 
   * - 如果只带有 事件名 参数, 就移除这个事件名下的所有事件,
   * - 如果带有 两个 参数, 那么就是表示移除某一个事件的具体处理函数
   * */
  off(name, handler){
    if(arguments.length === 0){
      this.eventObjs = {};
    }else if(arguments.length === 1){
      this.eventObjs[name] = []; 
    }else if (arguments.length === 2){
      let fn = this.eventObjs[name];
      if(!fn) return;
      for (let i = fn.length; i >= 0; i--) {
       if(fn[i] === handler){
          fn.splice(i, 1);
       }
      }
    }
  }
  // 发射函数，触发事件，包装参数，传递给事件参数
  emit(name, once = false){``
    let args = Array.prototype.slice.call(arguments, 2);
    let tasks = this.eventObjs[name].slice();  // 创建副本，如果回调函数内部继续注册相同事件，会造成死循环
    if( !tasks ) return;
    for (const fn of tasks) {
      fn.apply(null, args)
    }
    if(once){
      delete this.eventObjs[ name ];
    }
  }
}

let eventBus = new EventEmitter()
let fn1 = function(name, age){
  console.log(`${name}${age}`);
}
let fn2 = function(name, age){
  console.log(`hello,${name}${age}`);
}

eventBus.on('aaa', fn1)
eventBus.on('aaa', fn2)
eventBus.emit('aaa', false, '布兰', 12)
console.log('-----', eventBus.eventObjs);
eventBus.off()
console.log('-----', eventBus.eventObjs);
eventBus.on('aaa', fn2)
console.log('-----', eventBus.eventObjs);