export function append(el, child) {
    if (typeof child === 'string') {
        el.insertAdjacentHTML('beforeend', child);
    } else {
        el.appendChild(child);
    }
    
    return el.lastElementChild;
}

export function hide(el) {
  el.style.display = 'none';
}

export function show(el) {
  el.style.display = '';
}

export function elementChildOf(element, parent) {
    while ( (element = element.parentNode) && element !== parent);
    
    return !!element
}

export function siblings(element) {
    return Array.prototype.filter.call(element.parentNode.children, function(child){
      return child !== element;
    });
}

export function hasClass (el, className) {
    var test;
    if(el.classList)
        test = el.classList.contains(className)
    else 
        test = new RegExp('(^| )' + className + '( |$)', 'gi').test(el.className);
    return test
}

export function addClass(el, className) {
    if (el.classList){
        each(className.split(" "), function(className){
            el.classList.add(className);
        });
    } else 
        el.className += ' ' + className;
}

export function removeClass(el, className) {
    var removeClassFunction = function (el) {
        if (el.classList)
          el.classList.remove(className);
        else
          el.className = el.className.replace(new RegExp('(^|\\b)' + className.split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
    }
    if (NodeList.prototype.isPrototypeOf(el))
        each(el, removeClassFunction)
    else
        removeClassFunction(el);
}

export function toggleClass(el, className, toggle) {
  el.classList.toggle(className, toggle);
}

export function trigger(el, eventName) {
    var event = document.createEvent('HTMLEvents');
    event.initEvent(eventName, true, false);
    el.dispatchEvent(event);
}

export function each (elements, method){
    for(var i=0; i < elements.length; i++){
        method(elements[i], i);
    }
}

export function map (elements, method){
    var results = [];
    for(var i=0; i < elements.length; i++){
        results.push(method(elements[i], i));
    }
    return results;
}

export function is_visible(element){
    return element.offsetParent !== null;
}

export function is_focus(element){
    return document.activeElement === element;
}

export function is_empty(element){
    return element.innerHTML === "";
}

export function css (el, rule) {
    return getComputedStyle(el)[rule];
}

export function remove (el) {
  if (el instanceof NodeList) {
    el.forEach(remove);
  } else {
    el.parentNode.removeChild(el);
  }
}

export function createElement(html) {
    var container = document.createElement('div');
    container.innerHTML = html;
    return container.children[0];
}

export function closest(el, selector) {
    if(el.closest) return el.closest(el);
    while (el) {
        if (Element.prototype.matches ? el.matches(selector) : el.msMatchesSelector(selector)) {
            return el;
        }
        el = el.parentElement;
    }
}

export function ancestors(el) {
    var ancestors = [];
    el = el.parentElement;
    while (el){
        ancestors.push(el);
        el = el.parentElement;
    }
    return ancestors;
}

export function filter(nodes, predicate){
    var filteredNodes = [];
    each(nodes, function(node){
        if(predicate(node)) filteredNodes.push(node);
    });
    return filteredNodes;
}

export function offset(el){
    var rect = el.getBoundingClientRect();
    return { 
      top: rect.top + window.scrollY,
      left: rect.left + window.scrollX
    }
}

export function offsetToViewport(el){
    var rect = el.getBoundingClientRect();
    return { 
      top: rect.top,
      left: rect.left
    }
}

export function outerHeight(el){
    var height = el.offsetHeight;
    var style = getComputedStyle(el);

    height += parseInt(style.marginTop) + parseInt(style.marginBottom);
    return height;
}

export function outerWidth(el){
    var width = el.offsetWidth;
    var style = getComputedStyle(el);

    width += parseInt(style.marginLeft) + parseInt(style.marginRight);
    return width;
}

export function setWidth(el, value) {
  if (typeof value === "string") {
    el.style.width = value;
  } else {
    el.style.width = value + "px";
  }
}

export function isTagType(el, type) {
  el.tagName.toUpperCase() === type.toUpperCase();
}