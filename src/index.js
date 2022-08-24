import {initMixin} from './init'
import {lifecycleMixin} from './lifecycle'
import {renderMixin} from './vdom'
import {initGlobalApi} from './global-api'
import {stateMixin} from './state'


function Vue(options) {
    this._init(options) // new 就调用初始化方法
}


initMixin(Vue) // 初始化实例,编译模板
lifecycleMixin(Vue) //声明周期相关的
renderMixin(Vue) // render函数构建虚拟dom
stateMixin(Vue)
//静态方法 Vue.component,Vue.directive,Vue.extend,Vue.mixin..
initGlobalApi(Vue)

export default Vue;
