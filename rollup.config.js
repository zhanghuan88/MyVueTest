import babel from 'rollup-plugin-babel';
import resolve from '@rollup/plugin-node-resolve';

export default {
    input: "./src/index.js",
    output: {
        file: "./dist/vue.js",
        name: "Vue",
        format: "umd", // umd(兼容adm cjs iife), iife自执行函数, es, cjs, amd
        sourcemap: true
    },
    plugins: [
        babel({
            exclude: 'node_modules/**'
        }),
        resolve({})
    ]
}
