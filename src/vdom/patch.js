export function patch(oldVnode, newVnode) {
    if (!oldVnode) {
        return createEle(newVnode);
    }
    if (oldVnode.nodeType === 1) {//真实的节点
        //将虚拟节点转化真实节点
        let el = createEle(newVnode);
        let parentEl = oldVnode.parentNode;
        parentEl.insertBefore(el, oldVnode.nextSibling);
        parentEl.removeChild(oldVnode); //删除老的节点
        return el;
    } else {
        //1.比较元素标签,标签不一样直接替换
        if (oldVnode.tag !== newVnode.tag) {
            return oldVnode.el.parentNode.replaceChild(createEle(newVnode), oldVnode.el);
        }
        //2.文本比较
        if (!oldVnode.tag) {
            if (oldVnode.text !== newVnode.text) {
                return oldVnode.el.textContent = newVnode.text;
            }
        }
        // 3.标签一样.比较标签属性
        let el = newVnode.el = oldVnode.el;
        updateProperties(newVnode, oldVnode.data);

        // 4.比较子节点
        let newChildren = newVnode.children || [];
        let oldChildren = oldVnode.children || [];
        if (newChildren.length > 0 && oldChildren.length > 0) {
            // 老的有子,新的也有子,使用diff算法
            updateChildren(newChildren, oldChildren, el);
        } else if (oldChildren.length > 0) { // 新的没有
            el.innerHTML = ""
        } else if (newChildren.length > 0) { //老的没有
            for (let i = 0; i < newChildren.length; i++) {
                const child = newChildren[i];
                el.append(createEle(child));

            }
        }
    }

}

function isSameVnode(oldStartNode, newStartNode) {
    return (oldStartNode.tag === newStartNode.tag) && (oldStartNode.key === newStartNode.key);
}

function updateChildren(newChildren, oldChildren, parent) {
    let oldStartIndex = 0;
    let oldStartNode = oldChildren[0];
    let oldEndIndex = oldChildren.length - 1;
    let oldEndNode = oldChildren[oldEndIndex];

    let newStartIndex = 0;
    let newStartNode = newChildren[0];
    let newEndIndex = newChildren.length - 1;
    let newEndNode = newChildren[newEndIndex];
    const makeIndexByKey = (children) => {
        return children.reduce((memo, current, index) => {
            if (current.key) {
                memo[current.key] = index;
            }
            return memo;
        }, {})
    }
    const keysMap = makeIndexByKey(oldChildren);
    while (oldStartIndex <= oldEndIndex && newStartIndex <= newEndIndex) {
        if (!oldStartNode) { // 已经被移动走了
            oldStartNode = oldChildren[++oldStartIndex];
        } else if (!oldEndNode) {
            oldEndNode = oldChildren[--oldEndIndex];
        }
        if (isSameVnode(oldStartNode, newStartNode)) { //头部比较
            patch(oldStartNode, newStartNode);
            oldStartNode = oldChildren[++oldStartIndex];
            newStartNode = newChildren[++newStartIndex];
        } else if (isSameVnode(oldEndNode, newEndNode)) { //尾部比较
            patch(oldEndNode, newEndNode);
            oldEndNode = oldChildren[--oldEndIndex];
            newEndNode = newChildren[--newEndIndex];

        } else if (isSameVnode(oldStartNode, newEndNode)) { //老的头部和新的尾部
            patch(oldStartNode, newEndNode);
            parent.insertBefore(oldStartNode.el, oldEndNode.el.nextSibling);
            oldStartNode = oldChildren[++oldStartIndex];
            newEndNode = newChildren[--newEndIndex];
        } else if (isSameVnode(oldEndNode, newStartNode)) { //老的尾部和新的头部
            patch(oldEndNode, newStartNode);
            parent.insertBefore(oldEndNode.el, oldStartNode.el);
            oldEndNode = oldChildren[--oldEndIndex];
            newStartNode = newChildren[++newStartIndex];
        } else { //暴力对比
            // 1.需要根据key和 对应的索引将老的内容生成程映射表
            let moveIndex = keysMap[newStartNode.key]; // 用新的去老的中查找
            if (moveIndex == undefined) { // 如果不能复用直接创建新的插入到老的节点开头处
                parent.insertBefore(createEle(newStartNode), oldStartNode.el);
            } else {
                let moveNode = oldChildren[moveIndex];
                oldChildren[moveIndex] = null; // 此节点已经被移动走了
                parent.insertBefore(moveNode.el, oldStartNode.el);
                patch(moveNode, newStartNode); // 比较两个节点的属性
            }
            newStartNode = newChildren[++newStartIndex]
        }
    }
    if (newStartIndex <= newEndIndex) {
        for (let i = newStartIndex; i <= newEndIndex; i++) {
            let ele = newChildren[newEndIndex + 1] == null ? null : newChildren[newEndIndex + 1].el;
            parent.insertBefore(createEle(newChildren[i]), ele);
        }
    }
    if (oldStartIndex <= oldEndIndex) {
        for (let i = oldStartIndex; i <= oldEndIndex; i++) {
            //  如果老的多 将老节点删除 ， 但是可能里面有null 的情况
            if (oldChildren[i] !== null) parent.removeChild(oldChildren[i].el);
        }
    }
}

function createComponent(vnode) {
    // 调用hook的init方法
    let i = vnode.data;
    if ((i = i.hook) && (i = i.init)) {
        i(vnode);
    }
    if (vnode.componentInstance) {
        return true;
    }
}

export function createEle(vnode) {
    let {tag, data, key, children, text} = vnode;
    if (typeof tag === 'string') {
        if (createComponent(vnode)) {
            return vnode.componentInstance.$el
        }
        vnode.el = document.createElement(tag);
        // 添加属性
        updateProperties(vnode);
        children.forEach(child => {
            vnode.el.appendChild(createEle(child));
        });
    } else {
        vnode.el = document.createTextNode(text);
    }
    return vnode.el;
}

function updateProperties(vnode, oldProps = {}) {
    let newProps = vnode.data || {};
    let el = vnode.el;
    // 老的有,新的没有需要删除属性
    for (let key in oldProps) {
        if (!newProps[key]) {
            el.removeAttribute(key);
        }
    }
    // 样式处理
    let newStyle = newProps.style || {};
    let oldStyle = oldProps.style || {};
    // 老的样式中有,新的没有
    for (let key in oldStyle) {
        if (!newStyle[key]) {
            el.style[key] = '';
        }
    }
    for (let key in newProps) {
        if (key === "style") {
            for (let styleName in newProps.style) {
                el.style[styleName] = newProps.style[styleName];
            }
        } else if (key === "class") {
            el.className = newProps.class;
        } else {
            el.setAttribute(key, newProps[key]);
        }
    }
}
