let oldArrayMethods = Array.prototype;
let arrayMethods = Object.create(oldArrayMethods);
const methodsToPatch = [ // 需要重写数组的方法名
    'push',
    'pop',
    'shift',
    'unshift',
    'splice',
    'sort',
    'reverse'
]
methodsToPatch.forEach(method => {
    arrayMethods[method] = function (...args) {
        const result = oldArrayMethods[method].apply(this, args); //内部调用原来的方法，函数的劫持 切片编程
        // 我们需要对新增的数据再次进行劫持
        let inserted;
        let observer = this.__ob__;
        switch (method) {
            case 'push':
            case 'unshift':
                // 新增的数据
                inserted = args;
                break;
            case 'splice':
                inserted = args.slice(2); // 后面的参数是新增的数据
                break;
            default:
                break;
        }
        if (inserted) {
            // 新增的数据进行劫持
            observer.observeArray(inserted);
        }
        observer.dep.notify(); // 通知所有订阅者更新
        return result;
    }
})
export {
    arrayMethods
};
