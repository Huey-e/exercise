/**
 * @Description: 深度优先遍历  先遍历子节点 在遍历同级节点  从上往下
 * @Author: Cong Haiyang
 * @Date: 2023-02-14 14:13:20
 */
class Node {
  constructor(value, children = []) {
    this.value = value;
    this.children = children;
  }
}

function depthFirstTraversal(node, result = []) {
  result.push(node.value);
  for (const child of node.children) {
    depthFirstTraversal(child, result);
  }
  return result;
}

const root = new Node(1, [
  new Node(2, [
    new Node(4),
    new Node(5)
  ]),
  new Node(3, [
    new Node(6),
    new Node(7)
  ])
]);

console.log(depthFirstTraversal(root)); // [1, 2, 4, 5, 3, 6, 7]
