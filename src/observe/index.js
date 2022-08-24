import {arrayMethods} from './array'
import {defineProperty} from '../util'
import Dep from './dep'

export function defineReactive(data, key, value) { // 闭包 属性劫持
    let ob = observe(value);//对属性是对象的再次劫持
    let dep = new Dep();
    Object.defineProperty(data, key, {
        get() { // 取值会调用get方法
            if (Dep.target) {
                dep.depend();//调用depend方法
                if (ob) {
                    ob.dep.depend();
                }
            }
            return value;
        },
        set(newVal) { // 设置值会调用set方法
            if (value === newVal) return;
            observe(value);//用户设置属性是对象时再次劫持
            value = newVal;
            dep.notify();//通知所有订阅者更新
        }
    })
}

class Observer {
    constructor(data) {
        //给data对象添加一个__ob__属性，表示这个data对象是被观测的,属性不可枚举
        defineProperty(data, '__ob__', this)
        this.dep = new Dep();
        if (Array.isArray(data)) {
            //不劫持数组每个值,属性太差了,重写数组的方法 7个变异方法 是可以修改数组本身
            data.__proto__ = arrayMethods;
            // 数组中的引用类型继续劫持
            this.observeArray(data)

        } else {
            this.walk(data);
        }
    }

    walk(data) {//循环对象,对属性依次劫持
        // 重新定义属性的getter和setter
        Object.keys(data).forEach(key => defineReactive(data, key, data[key]));
    }

    observeArray(data) { // 观测数组中的引用类型
        data.forEach(item => observe(item))
    }
}

export function observe(data) {
    // 如果data不是对象
    if (typeof data !== 'object' || data === null) {
        return;//只对对象进行劫持
    }

    // 如果对象被劫持过了.就不再劫持
    if (data.__ob__ instanceof Observer) {
        return data.__ob__;
    }
    return new Observer(data)
}
