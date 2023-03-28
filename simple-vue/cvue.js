/**
 * @Description: 
 * @Author: Cong Haiyang
 * @Date: 2023-02-02 11:24:04
 */
 
 function CVue(options){
  this._data = options.data;
  this._el = options.el;
  let elm = document.querySelector(options.el)
  this._template = elm;
  this._parent = elm.parentNode

  this.initData(); // 将 data 进行响应式转换，进行代理

  this.mount(); // 挂载
 }
