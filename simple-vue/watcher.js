/**
 * @Description: watcher
 * @Author: Cong Haiyang
 * @Date: 2023-02-02 11:23:44
 */

let watcherId = 0;

class Watcher{

   /**
   * 
   * @param {Object} vm JGVue 实例
   * @param {String|Function} expOrfn 如果是渲染 watcher, 传入的就是渲染函数, 如果是 计算 watcher 传入的就是路径表达式, 暂时只考虑 expOrFn 为函数的情况.
   */
  constructor(vm, expOrfn){
    this.vm = vm;
    this.getter = expOrfn;

    this.id = watcherId++;

    this.deps = []; // 依赖项

    this.depIds = {}; //  是一个 Set 类型, 用于保证 依赖项的唯一性 ( 简化的代码暂时不实现这一块 )

    this.get();
  }

 /** 计算, 触发 getter */
  get(){
    pushTarget(this);
    this.getter.call(this.vm, this.vm)
    popTarget();
  }
 
  /**
   * 执行, 并判断是懒加载, 还是同步执行, 还是异步执行: 
   * 我们现在只考虑 异步执行 ( 简化的是 同步执行 )
   */
  run(){
    this.get();
  }

  // 属性发生变法，触发，对外方法
  update(){
    this.run()
  }

  // 清空依赖项
  cleanupDep(){

  }

  // 将当前的 dep与watcher 关联
  addDep(dep){
    this.deps.push(dep)
    console.log('----dep----', this.deps);
  }
}
