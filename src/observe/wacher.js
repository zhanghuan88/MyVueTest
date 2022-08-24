import {popTarget, pushTarget} from './dep'
import {nextTick} from '../util'

let id = 0;

class Watcher {
    constructor(vm, exprOrFunc, cb, options) {
        this.vm = vm;
        this.exprOrFunc = exprOrFunc;
        this.cb = cb;
        this.options = options;
        this.user = options.user;// 用户watcher,用户自定义watch的
        this.lazy = options.lazy;// 如果有lazy属性,表示是计算属性
        this.dirty = this.lazy;// 是否需要更新
        this.isWatcher = typeof exprOrFunc === 'function';
        this.id = id++;
        this.deps = [];
        this.depIds = new Set();
        if (typeof exprOrFunc === 'function') {
            this.getter = exprOrFunc;
        } else {
            this.getter = function () {
                let path = exprOrFunc.split('.');
                let value = this.vm;
                for (let i = 0; i < path.length; i++) {
                    value = value[path[i]];
                }
                return value;
            }
        }
        this.value = this.lazy ? void 0 : this.get();
    }

    addDep(dep) {
        let id = dep.id;
        if (!this.depIds.has(id)) {
            this.depIds.add(id);
            this.deps.push(dep);
            dep.addSub(this);
        }
    }

    get() {
        pushTarget(this);
        let result = this.getter.call(this.vm);
        popTarget()
        return result;
    }

    run() {
        let newValue = this.get();
        let oldValue = this.value;
        this.value = newValue;
        if (this.user) {
            this.cb.call(this.vm, newValue, oldValue);
        }
    }

    update() {
        if (this.lazy) {
            this.dirty = true;
        } else {
            queueWatcher(this);
        }
    }

    evaluate() {
        this.value = this.get();
        this.dirty = false;
    }

    depend() {
        let i = this.deps.length;
        while (i--) {
            this.deps[i].depend();
        }
    }
}

let queue = [];//更新队列
let has = {};//watcher去重
let pending = false;

function flushSchedulerQueue() {
    pending = false;
    queue.forEach(watcher => {
        watcher.run();
        if (watcher.isWatcher) {
            watcher.cb()
        }
    });
    queue = [];
    has = {};
}

function queueWatcher(watcher) {
    let id = watcher.id;
    if (!has[id]) {
        has[id] = true;
        queue.push(watcher);
        if (!pending) {
            pending = true;
            nextTick(flushSchedulerQueue)
        }
    }
}

export default Watcher;
