const defaultTagRE = /\{\{((?:.|\r?\n)+?)}}/g; // {{aaaaa}}

function gen(child) {
    if (child.type === 1) {
        return generate(child);
    } else if (child.type === 3) {
        let text = child.text;
        // 如果是普通文本 不带{{}}
        if (!defaultTagRE.test(text)) {
            return `_v(${JSON.stringify(text)})`;
        }
        let tokens = [];
        let lastIndex = defaultTagRE.lastIndex = 0;
        let match, index;
        while (match = defaultTagRE.exec(text)) {
            index = match.index;
            if (index > lastIndex) {
                tokens.push(JSON.stringify(text.slice(lastIndex, index)));
            }
            tokens.push(`_s(${match[1].trim()})`);
            lastIndex = index + match[0].length;
        }
        if (lastIndex < text.length) {
            tokens.push(JSON.stringify(text.slice(lastIndex)));
        }
        return `_v(${tokens.join('+')})`;
    }
}

function genChildren(ast) {
    let children = ast.children;
    if (children) {
        return children.map(child => {
            return gen(child);
        }).join(',');
    }
    return undefined;
}

function genProps(attrs) { // [{name:'xxx',value:'xxx'},{name:'xxx',value:'xxx'}]
    let str = '';
    for (let i = 0; i < attrs.length; i++) {
        let attr = attrs[i];
        if (attr.name === 'style') { // color:red;background:blue
            let styleObj = {};
            attr.value.split(';').forEach(item => {
                let [key, value] = item.split(':');
                styleObj[key] = value;
            })
            attr.value = styleObj
        }
        str += `${attr.name}:${JSON.stringify(attr.value)},`;
    }
    return `{${str.slice(0, -1)}}`
}


export function generate(ast) {
    let children = genChildren(ast);
    let code = `_c('${ast.tag}',${
        ast.attrs.length ? genProps(ast.attrs) : 'undefined'
    }${
        children ? `,${children}` : ''
    })`;
    return code;
}
