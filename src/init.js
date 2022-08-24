import {initState} from './state'
import {compileToFunction} from './compile';
import {callHook, mountComponent} from './lifecycle'
import {mergeOptions} from './util'

export function initMixin(Vue) {// 给Vue添加_init方法
    Vue.prototype._init = function (options) { //用于初始化Vue实例的方法
        const vm = this;
        // vue vm.$options 就是获取用户的配置
        vm.$options = mergeOptions(vm.constructor.options, options); //需要将用户自定义的options 和全局的options做合并
        callHook(vm, 'beforeCreate');
        //初始化状态
        initState(vm);
        callHook(vm, 'created');
        if (options.el) {
            vm.$mount(options.el); //实现数据的挂载
        }
    }
    Vue.prototype.$mount = function (el) {
        const vm = this;
        el = document.querySelector(el);
        vm.$el = el;
        let options = vm.$options;
        if (!options.render) {
            let template = options.template; // 用户设置属性template,则用template渲染
            if (!template && el) {
                template = el.outerHTML // 否则用el的html代码渲染
            }
            template = template.trim();
            if (template) {
                options.render = compileToFunction(template);
            }
        }
        // 挂载到el上
        mountComponent(vm, el);
    }
}
