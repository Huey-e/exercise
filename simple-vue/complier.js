/**
 * @Description: 
 * @Author: Cong Haiyang
 * @Date: 2023-02-02 11:23:50
 */
/** 由 HTML DOM -> VNode: 将这个函数当做 compiler 函数 */
function getVNode(node){
  let nodeType = node.nodeType; // 得到dom类型
  let _vnode = null;
  if(nodeType === 1){  // 元素
    let nodeName = node.nodeName; // div
    let attrs = node.attributes;
    let _attrObj = {}; // {title: '11', id: 'a', name: '...'}
    for(let i = 0; i < attrs.length; i++ ){
        _attrObj[ attrs[i].nodeName ] = attrs[i].nodeValue
    }
    _vnode = new VNode(nodeName, _attrObj, undefined, nodeType);

    // 考虑有子元素
    let childNodes = node.childNodes;
    for(let i = 0; i < childNodes.length; i++){
      _vnode.appendChild(getVNode(childNodes[i])) // 递归
    }
  }else if(nodeType === 3){ // 文本
    _vnode = new VNode(undefined, undefined, node.nodeValue, nodeType)
  }

  return _vnode;
}

// 将虚拟DOM转换成真正的DOM  对应上面
function paseVNode(vnode){
  // 创建真是的 DOM  按照dom类型
  let type = vnode.type;
  let _node = null;
  if(type === 3){
    return document.createTextNode(vnode.value); // 创建文本节点
  }else if(type === 1){
    _node = document.createElement(vnode.tag);

    // 在绑定属性
    let data = vnode.data;
    Object.keys(data).forEach(key=>{
      let attrName = key;
      let attrVal = data[key];
      _node.setAttribute(attrName, attrVal);
    })

    // 嵌入子元素
    let children = vnode.children;
    children.forEach(subnode=>{
      _node.appendChild(paseVNode(subnode))  // 递归转换子元素 将子元素添加到父级dom下
    })
    return _node;
  }
}

// 提取DOM中  {{xx.xx.xx}} 找到准确值
let rkuohao = /\{\{(.+?)\}\}/g;
// 根据路径 访问对象成员
function getValueByPath(obj, path){
  let paths = path.split('.'); 
  let res = obj;
  let prop;
  while(prop = paths.shift()){
    res = res [prop];
  }
  return res;
}

// 将虚拟DOM与 data 结合替换
function combine(vnode, data){
  let _type = vnode.type;
  let _data = vnode.data;
  let _value = vnode.value;
  let _tag = vnode.tag;
  let _children = vnode.children;

  let _vnode = null;

  if(_type === 3){ // 文本

    _value = _value.replace(rkuohao, function(_, g){
      return getValueByPath(data, g.trim())
    })

    _vnode = new VNode(_tag, _data, _value, _type)

  } else if(_type === 1){ // 元素
    _vnode = new VNode(_tag, _data, _value, _type);
    _children.forEach(_subnode => _vnode.appendChild(combine(_subnode, data)))
  }
  return _vnode;
}