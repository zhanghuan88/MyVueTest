const ncname = `[a-zA-Z_][\\-\\.0-9_a-zA-Z]*`; // 标签名
const qnameCapture = `((?:${ncname}\\:)?${ncname})`; //  用来获取的标签名的 match后的索引为1的
const startTagOpen = new RegExp(`^<${qnameCapture}`); // 匹配开始标签的
const endTag = new RegExp(`^<\\/${qnameCapture}[^>]*>`); // 匹配闭合标签的

const attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/; // a=b  a="b"  a='b'
const startTagClose = /^\s*(\/?)>/; //     />   <div/>

export function parseHtml(html) {
    function createAstElement(tagName, attrs) {
        return {
            tag: tagName, // 标签名
            attrs: attrs, // 属性集合
            children: [], // 子节点
            type: 1, // 1代表元素节点
            parent: null,// 父节点
        }
    }

    let root;
    let currentParent;
    let stack = []; // 标签栈
    function start(tagName, attrs) {
        let element = createAstElement(tagName, attrs);
        if (!root) {
            root = element;
        }
        currentParent = element;
        stack.push(element)
    }

    function end(tagName) {
        let element = stack.pop();
        if (element.tag !== tagName) {
            throw new Error(`invalid end tag,expect ${lastName},but got ${tagName}`)
        }
        currentParent = stack[stack.length - 1];
        if (currentParent) {
            element.parent = currentParent;
            currentParent.children.push(element);
        }
    }

    function chars(text) {
        text = text.trim();
        if (text) {
            currentParent.children.push({
                type: 3, // 3代表文本节点
                text: text // 文本内容
            })
        }
    }

    function advance(pos) {
        html = html.substring(pos);
    }

    function parseStartTag() {
        const start = html.match(startTagOpen);
        if (start) {
            const match = {
                tagName: start[1],
                attrs: []
            }
            advance(start[0].length);// 删除匹配的标签的字符串
            let end, attr;
            while (!(end = html.match(startTagClose)) && (attr = html.match(attribute))) {
                advance(attr[0].length);
                match.attrs.push({
                    name: attr[1],
                    value: attr[3] || attr[4] || attr[5]
                })
            }
            if (end) { // 还剩 开始便签的 > 去除
                advance(end[0].length);
                return match;
            }
        }

    }

    while (html) { // 看要解析的内容是否存在，如果存在就不停的解析
        let textEnd = html.indexOf('<'); // 当前解析的开头
        if (textEnd === 0) {
            const startTagMatch = parseStartTag(html); // 解析开始标签
            if (startTagMatch) {
                start(startTagMatch.tagName, startTagMatch.attrs);
                continue;
            }
            const endTagMatch = html.match(endTag); // 解析闭合标签
            if (endTagMatch) {
                advance(endTagMatch[0].length);
                end(endTagMatch[1]);
            }
        }
        // 解析文本
        let text;
        if (textEnd > 0) {
            text = html.substring(0, textEnd);
        }
        if (text) {
            advance(text.length);
            chars(text);
        }
    }
    return root;
}
