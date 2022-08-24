import {parseHtml} from './parse'
import {generate} from './generate'


export function compileToFunction(template) {
    // 1.将模板字符串转换成AST语法树
    const ast = parseHtml(template);
    // 2.优化AST语法树

    // 3.将AST语法树转换成render函数
    let code = generate(ast);
    // 4.编译render函数
    return new Function(`with(this){return ${code}}`);
}
