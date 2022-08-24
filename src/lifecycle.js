import {patch} from './vdom/patch'
import Wacher from './observe/wacher'

export function lifecycleMixin(Vue) {
    Vue.prototype._update = function (vnode) {
        const vm = this;
        const preVnode = vm._vnode;
        if (!preVnode) { //第一次加载
            vm.$el = patch(vm.$el, vnode);
        } else { //更新
            vm.$el = patch(preVnode, vnode);
        }
        vm._vnode = vnode;
    }
}

export function mountComponent(vm, el) {
    callHook(vm, 'beforeMount');
    // 先用render函数渲染出一个虚拟DOM,再挂载到el上
    const updateComponent = () => {
        vm._update(vm._render());
    }
    new Wacher(vm, updateComponent, () => {
        callHook(vm, 'updated');
    }, true)
    callHook(vm, 'mounted');
}

export function callHook(vm, hook) {
    const handlers = vm.$options[hook];// 生命周期函数数组
    if (handlers) {
        for (let i = 0; i < handlers.length; i++) {
            handlers[i].call(vm);
        }
    }

}
