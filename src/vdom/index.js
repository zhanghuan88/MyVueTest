import {isReservedTag} from '../util'

export function renderMixin(Vue) {
    Vue.prototype._c = function () { // _c是createElement的缩写
        return createElement(this, ...arguments);
    }
    Vue.prototype._v = function (text) { // _v是createTextNode的缩写
        return createTextNode(text);
    }
    Vue.prototype._s = function (val) { // _s是字符串的缩写
        return val == null ? '' : typeof val === 'object' ? JSON.stringify(val) : val;
    }
    Vue.prototype._render = function () {
        const vm = this;
        const {render} = vm.$options;
        return render.call(vm);
    }
}


function createElement(vm, tag, data = {}, ...children) {
    if (isReservedTag(tag)) {
        return vnode(tag, data, data.key, children);
    } else {
        let Ctor = vm.$options.components[tag]
        return createComponent(vm, tag, data, data.key, children, Ctor)
    }
}

function createComponent(vm, tag, data, key, children, Ctor) {
    const baseCtor = vm.$options._base;
    if (typeof Ctor == 'object') {
        Ctor = baseCtor.extend(Ctor)
    }
    // 给组件增加生命周期
    data.hook = {
        init(vnode) {
            let child = vnode.componentInstance = new Ctor({});
            child.$mount()
        }
    }
    return vnode(`vue-component-${tag}-${Ctor.cid}`, data, key, undefined, undefined, {
        Ctor, children
    })
}

function createTextNode(text) {
    return vnode(undefined, undefined, undefined, undefined, text);
}

// 用来产生虚拟dom的函数
function vnode(tag, data, key, children, text, componentOptions) {
    return {
        tag,
        data,
        key,
        children,
        text,
        componentOptions
    }
}
