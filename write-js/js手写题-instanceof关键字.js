/**
 * @Description: instanceof实现
 * @Author: Cong Haiyang
 * @Date: 2023-02-14 09:52:41
 */
function instanceOf(left, right){
  let proto = left.__proto__;
  while (true) {
    if(proto === null) return false;
    if(proto === right.prototype){
      return true;
    }
    proto = __proto__;
  }
}