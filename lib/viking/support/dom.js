export function append(el, child) {
    if (typeof child === 'string') {
        el.insertAdjacentHTML('beforeend', child);
    } else {
        el.appendChild(child);
    }
    
    return el.lastElementChild;
}

export function elementChildOf(element, parent) {
    while((element=element.parentNode)&&element!==parentNode);
    
    return !!element
}