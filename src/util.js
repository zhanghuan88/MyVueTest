export function proxy(vm, target, key) {
    Object.defineProperty(vm, key, {
        get() {
            return vm[target][key];
        },
        set(newVal) {
            vm[target][key] = newVal;
        }
    })
}

export function defineProperty(target, key, value) {
    Object.defineProperty(target, key, {
        value: value,
        configurable: false,
        enumerable: false,
    })
}

export const LIFE_CYCLE = [
    'beforeCreate',
    'created',
    'beforeMount',
    'mounted',
    'beforeUpdate',
    'updated',
    'beforeDestroy',
    'destroyed',
]
const strats = {}


strats.components = function (parentVal, childVal) {
    // Vue.options.components
    let options = Object.create(parentVal); // 根据父对象构造一个新对象 options.__proto__= parentVal
    if (childVal) {
        for (let key in childVal) {
            options[key] = childVal[key];
        }
    }
    return options
}
// strats.data = function (parentVal, childVal) {
//     return childVal;
// }
//
// strats.computed = function () {
//
// }
// strats.watch = function () {
//
// }

function mergeHook(parentVal, childVal) { // 生命周期的合并
    if (childVal) {
        if (parentVal) {
            return parentVal.concat(childVal)
        } else {
            return [childVal]
        }
    } else {
        return parentVal;
    }
}

LIFE_CYCLE.forEach(hook => {
    strats[hook] = mergeHook;
})

export function mergeOptions(parent, child) {
    const options = {}

    for (let key in parent) {
        mergeField(key)
    }
    for (let key in child) {
        if (!parent.hasOwnProperty(key)) {
            mergeField(key)
        }
    }

    function mergeField(key) {
        if (strats[key]) {
            options[key] = strats[key](parent[key], child[key])
        } else {
            if (child[key]) {
                options[key] = child[key]
            } else {
                options[key] = parent[key]
            }
        }
    }

    return options;

}

let callback = [];
let pending = false;

function flushCallback() {
    while (callback.length) {
        const cb = callback.pop();
        cb();
    }
    pending = false;
}

let timerFunc;
if (Promise) {
    timerFunc = () => {
        Promise.resolve().then(flushCallback)
    }
} else if (MutationObserver) {
    let counter = 0;
    let observer = new MutationObserver(flushCallback);
    let textNode = document.createTextNode('');
    observer.observe(textNode, {
        characterData: true
    });
    timerFunc = () => {
        counter = (counter + 1) % 2;
        textNode.data = counter;
    }
} else if (setImmediate) {
    timerFunc = () => {
        setImmediate(flushCallback)
    }
} else {
    timerFunc = () => {
        setTimeout(flushCallback, 0)
    }
}

export function nextTick(cb) {
    callback.push(cb);
    if (!pending) {
        timerFunc();
        pending = true;
    }
}

function makeMap(str) {
    const mapping = {}
    str.split(',').forEach(key => {
        mapping[key] = true
    })
    return (key) => {
        return mapping[key]
    }
}

export const isReservedTag = makeMap(
    'a,div,ul, li,image,text,span,p,button,svg,input,'
)
