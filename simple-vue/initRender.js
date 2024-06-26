/**
 * @Description: 挂载
 * @Author: Cong Haiyang
 * @Date: 2023-02-02 11:22:57
 */


CVue.prototype.mount = function () {
  // 需要提供一个 render 方法: 生成 虚拟 DOM
  this.render = this.createRenderFn() // 带有缓存 ( Vue 本身是可以带有 render 成员 )

  this.mountComponent();
}


CVue.prototype.mountComponent = function () {
  // 执行 mountComponent() 函数 
  console.log('---');
  let mount = () => {  // 这里是一个函数, 函数的 this 默认是全局对象 "函数调用模式"
    console.log( '渲染开始' )
    this.update(this.render())
    console.log( '渲染完成' )
  }
  // 这个 Watcher 就是全局的 Watcher, 在任何一个位置都可以访问他了 ( 简化的写法 )
  new Watcher( this, mount ); // 相当于这里调用了 mount
}


// 这里是生成 render 函数, 目的是缓存 抽象语法树 ( 我们使用 虚拟 DOM 来模拟 )
CVue.prototype.createRenderFn = function () {
  let ast = getVNode(this._template);  // 真是DOM转虚拟dom
  // Vue: 将 AST + data => VNode
  // 我们: 带有坑的 VNode + data => 含有数据的 VNode
  return function render() {
    // 将 带有 坑的 VNode 转换为 待数据的 VNode
    let _tmp = combine(ast, this._data);
    return _tmp;
  }
}

// 将虚拟 DOM 渲染到页面中： vue源码里 diff算法就在这 
CVue.prototype.update = function (vnode) {
  // 简化, 直接生成 HTML DOM replaceChild 到页面中
  // 父元素.replaceChild( 新元素, 旧元素 )
  let realDOM = paseVNode(vnode);
  this._parent.replaceChild(realDOM, document.querySelector(this._el))
   // 这个算法是不负责任的: 
  // 每次会将页面中的 DOM 全部替换
}