/**
 * @Description: 虚拟DOM
 * @Author: Cong Haiyang
 * @Date: 2023-02-02 11:24:12
 */

class VNode {
  constructor(tag, data, value, type){
    this.tag = tag && tag.toLowerCase();
    this.data = data;
    this.value = value;
    this.type = type;
    this.children  = [];
  }
  // 添加子节点
  appendChild ( vnode ){
    this.children.push( vnode )
  }
}