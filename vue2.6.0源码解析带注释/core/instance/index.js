import { initMixin } from './init'
import { stateMixin } from './state'
import { renderMixin } from './render'
import { eventsMixin } from './events'
import { lifecycleMixin } from './lifecycle'
import { warn } from '../util/index'

/** Vue 构造函数 根本位置 */
function Vue (options) {
  instanceof  // 方法模式  函数模式  构造器模式  apply/call bind模式   上下文模式
  // 初始化
  this._init(options)
}

initMixin(Vue)        // 挂载初始化方法 ( _init )
stateMixin(Vue)       // 挂载 状态处理方法
eventsMixin(Vue)      // 挂载 事件 的方法
lifecycleMixin(Vue)   // 挂载 生命周期方法
renderMixin(Vue)      // 挂载与渲染有关的方法

export default Vue
