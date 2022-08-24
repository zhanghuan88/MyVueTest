import {observe} from './observe/index'
import {nextTick, proxy} from './util'
import Wacher from './observe/wacher'
import Dep from './observe/dep'

export function initState(vm) {
    const opt = vm.$options;//获取所有选项
    if (opt.props) {
        initProps(vm);
    }
    if (opt.methods) {
        initMethods(vm);
    }
    if (opt.data) {
        initData(vm);
    }
    if (opt.computed) {
        initComputed(vm);
    }
    if (opt.watch) {
        initWatch(vm);
    }
}

function initProps(vm) {

}

function initMethods(vm) {

}


function initData(vm) {
    let data = vm.$options.data; //获取data选项 可能是函数或者对象
    data = vm._data = typeof data === 'function' ? data.call(vm) : data;
    // 对数据进行劫持 采用defineProperty方法
    observe(data);
    // 将vm._data 用vm来代理就可以直接vm.xx访问data属性
    for (let key in data) {
        proxy(vm, '_data', key);
    }
}

function initComputed(vm) {
    let computed = vm.$options.computed;
    const watchers = vm._computedWatchers = {};
    for (let key in computed) {
        let userDef = computed[key];
        let getter = typeof userDef === 'function' ? userDef : userDef.get;
        watchers[key] = new Wacher(vm, getter, () => {
        }, {lazy: true});
        defineComputed(vm, key, userDef);
    }
}

const sharedPropertyDefinition = {}

function defineComputed(vm, key, userDef) {
    if (typeof userDef === 'function') {
        sharedPropertyDefinition.get = createComputedGetter(key);
    } else {
        sharedPropertyDefinition.get = createComputedGetter(key);
        sharedPropertyDefinition.set = userDef.set;
    }
    Object.defineProperty(vm, key, sharedPropertyDefinition);
}

function createComputedGetter(key) {
    return function () {
        const watcher = this._computedWatchers[key];
        if (watcher) {
            if (watcher.dirty) {
                watcher.evaluate();//对当前值进行计算
            }
            if (Dep.target) {
                watcher.depend()
            }
            return watcher.value; // 默认返回watch取的值
        }
    }
}

function initWatch(vm) {
    let watch = vm.$options.watch;
    for (let key in watch) {
        const handler = watch[key];
        if (Array.isArray(handler)) {
            handler.forEach(handle => {
                createWatcher(vm, key, handle);
            })
        } else {
            createWatcher(vm, key, handler);
        }
    }
}

export function createWatcher(vm, exprOrFn, handler, options) {
    if (typeof handler === 'object') {
        options = handler;
        handler = handler.handler;
    }
    if (typeof handler === 'string') {
        handler = vm[handler];
    }
    return vm.$watch(exprOrFn, handler, options);
}

export function stateMixin(Vue) {
    Vue.prototype.$nextTick = function (cb) {
        nextTick(cb);
    }
    Vue.prototype.$watch = function (exprOrFn, cb, options) {
        new Wacher(this, exprOrFn, cb, {...options, user: true});
        if (options.immediate) {
            cb.call(this);
        }
    }
}
