// import Model from 'viking/record';
import { each, result } from '../../support';
import { last } from '../../support/array';
import Model from '../../record';

// import View from 'viking/view';
// import Helpers from 'viking/view/helpers';

const booleanAttributes = ['disabled', 'readonly', 'multiple', 'checked',
    'autobuffer', 'autoplay', 'controls', 'loop', 'selected', 'hidden',
    'scoped', 'async', 'defer', 'reversed', 'ismap', 'seemless', 'muted',
    'required', 'autofocus', 'novalidate', 'formnovalidate', 'open',
    'pubdate', 'itemscope'];

    // tag(name, [options = {})
// ========================================
//
// Returns an empty HTML tag of type `name` add HTML attributes by passing
// an attributes hash to `options`. Set escape to `false` to disable attribute
// value escaping.
//
// Arguments
// ---------
// - Use `true` with boolean attributes that can render with no value, like `disabled` and `readonly`.
// - HTML5 data-* attributes can be set with a single data key pointing to a hash of sub-attributes.
// - Values are encoded to JSON, with the exception of strings and symbols.
//
// Examples
// --------
//
//   tag("br")
//   // => <br>
//
//   tag("input", {type: 'text', disabled: true})
//   // => <input type="text" disabled="disabled" />
//
//   tag("img", {src: "open & shut.png"})
//   // => <img src="open &amp; shut.png" />
//   
//   tag("img", {src: "open &amp; shut.png"}, false, false)
//   // => <img src="open &amp; shut.png" />
//   
//   tag("div", {data: {name: 'Stephen', city_state: ["Chicago", "IL"]}})
//   // => <div data-name="Stephen" data-city_state="[&quot;Chicago&quot;,&quot;IL&quot;]" />
//
// export function tag(name: string, options?)
export function tag(name, options) {
    var t = document.createElement(name);
    setTagOptions(t, options);
    return t;
};

// contentTag(name, [content], [options], [&block])
// ================================================================
//
// Returns an HTML block tag of type name surrounding the content. Add HTML
// attributes by passing an attributes hash to options. Instead of passing the
// content as an argument, you can also use a function in which case, you pass
// your options as the second parameter. Set escape to false to disable attribute
// value escaping.
//
// Examples
//
//   contentTag("p", "Hello world & all!")
//   // => <p>Hello world &amp; all!</p>
//
//   contentTag("p", "Hello world & all!", false)
//   // => <p>Hello world & all!</p>
//
//   contentTag("div", contentTag("p", "Hello world!"), {class: "strong"})
//   // => <div class="strong"><p>Hello world!</p></div>
//
//   contentTag("select", options, {multiple: true})
//   // => <select multiple="multiple">...options...</select>
//   
//   contentTag("div", {class: "strong"}, function() {
//      return "Hello world!";
//   });
//   // => <div class="strong">Hello world!</div>
//
// export function contentTag(name: string, content, options, escape: boolean = true)
export function contentTag(name, content, options) {
    let tmp;

    // Handle `name, content`, `name, content, options`,
    // `name, content, options, escape`, `name, content, escape`, `name, block`,
    // `name, options, block`, `name, options, escape, block`, && `name, escape, block`
    // style arguments
    if (typeof content === 'object') {
        if (typeof options === 'function') {
            tmp = options;
            options = content;
            content = tmp;
        } else if (typeof options === 'boolean') {
            tmp = content;
            content = options;
            options = tmp;
        }
    }
    if (typeof content === 'function') {
        content = content();
    } else if (content === undefined || content === null) {
        content = '';
    }
    
    var t = document.createElement(name);
    setTagOptions(t, options);
    if (content instanceof Promise) {
        return content.then((c) => {
            t.append(...c);
            return t;
        })
    } else {
        t.append(...content);
        return t;
    }
};

export function setTagOptions(el, options) {
    if (options === undefined) { return; }

    each(options, (key, value) => {
        if (value !== null && value !== undefined) {
            if (key === "data" && typeof value === 'object') {
                each(value, function (key, value) {
                    setDataTagOption(el, key, value);
                });
            } else if (value === true && booleanAttributes.includes(key)) {
                el.setAttribute(key, '');
            } else if (Array.isArray(value)) {
                el.setAttribute(key, value.join(" "));
            } else {
                el.setAttribute(key, value);
            }
        }
    });
}

// export function dataTagOption(key: string, value): string
export function setDataTagOption(el, key, value) {
    if (typeof value === 'object') { value = JSON.stringify(value); }
    el.setAttribute("data-" + key, value);
}

// see http://www.w3.org/TR/html4/types.html#type-name
//
// export function sanitizeToId(name: string): string
export function sanitizeToId(name) {
    return name.replace(/[^\-a-zA-Z0-9:.]/g, "_").replace(/_+/g, '_').replace(/_+$/, '').replace(/_+/g, '_');
}

// TODO: move to model_helpers?
//
// export function tagNameForModelAttribute(model, attribute, options: any = {})
export function tagNameForModelAttribute(model, attribute, options = {}) {
    let value = model.get(attribute);
    let name;

    if (options.namespace) {
        name = options.namespace + '[' + attribute + ']';
    } else {
        name = model.baseClass.modelName.paramKey + '[' + attribute + ']';
    }

    if (Array.isArray(value)) {
        name = name + '[]';
    }

    return name;
}

// TODO: move to model_helpers?
export function addErrorClassToOptions(model, attribute, options) {
    if (model.errorsOn(attribute)) {
        if (options['class']) {
            options['class'] = options['class'] + ' error';
        } else {
            options['class'] = 'error';
        }
    }
}

// TODO: move to model_helpers?
// TODO: testme
export function methodOrAttribute(model, funcOrAttribute) {
    if (typeof funcOrAttribute !== 'function') {
        if (model[funcOrAttribute]) {
            return result(model, funcOrAttribute);
        }

        return model.readAttribute(funcOrAttribute);
    }

    return funcOrAttribute(model);
}

// Returns an HTML image tag for the +source+. The +source+ can be a full
// path or a file.
//
// ==== Options
//
// You can add HTML attributes using the +options+. The +options+ supports
// two additional keys for convenience and conformance:
//
// * <tt>:alt</tt>  - If no alt text is given, the file name part of the
//   +source+ is used (capitalized and without the extension)
// * <tt>:size</tt> - Supplied as "{Width}x{Height}" or "{Number}", so "30x45" becomes
//   width="30" and height="45", and "50" becomes width="50" and height="50".
//   <tt>:size</tt> will be ignored if the value is not in the correct format.
//
// ==== Examples
//
//   imageTag("/assets/icon.png")
//   // => <img alt="Icon" src="/assets/icon.png">
//   imageTag("/assets/icon.png", {size: "16x10", alt: "A caption"})
//   // => <img src="/assets/icon.png" width="16" height="10" alt="A caption">
//   imageTag("/icons/icon.gif", size: "16")
//   // => <img src="/icons/icon.gif" width="16" height="16" alt="Icon">
//   imageTag("/icons/icon.gif", height: '32', width: '32')
//   // => <img alt="Icon" height="32" src="/icons/icon.gif" width="32">
//   imageTag("/icons/icon.gif", class: "menu_icon")
//   // => <img alt="Icon" class="menu_icon" src="/icons/icon.gif">
//
// export function imageTag(source:string, options)
export function imageTag(source, options) {
    var separator = /x/i,
        size,
        alt;

    if (!options) {
        options = {};
    }

    if (source) {
        options.src = source;
    }

    if (options.size) {
        size = options.size.search(separator) > 0 ? options.size.split(separator) : [options.size, options.size];
        options.width = size[0];
        options.height = size[1];
        delete options.size;
    }

    if (!options.alt) {
        alt = options.src.replace(/^.*[\\\/]/, '').split(/\./)[0];
        alt = alt.charAt(0).toUpperCase() + alt.slice(1);
        options.alt = alt;
    }

    return tag('img', options, false);
};

// buttonTag(content, options), buttonTag(options, block)
// ========================================================
//
// Creates a button element that defines a submit button, reset button or a
// generic button which can be used in JavaScript, for example. You can use
// the button tag as a regular submit tag but it isn't supported in legacy
// browsers. However, the button tag allows richer labels such as images and
// emphasis.
//
// Options
// -------
//      - disabled: If true, the user will not be able to use this input.
//      - Any other key creates standard HTML attributes for the tag
//
// Examples
// --------
//   buttonTag("Button")
//   // => <button name="button" type="submit">Button</button>
//   
//   buttonTag("Checkout", { :disabled => true })
//   // => <button disabled name="button" type="submit">Checkout</button>
//   
//   buttonTag({type: "button"}, function() {
//      return "Ask me!";
//   });
//   // <button name="button" type="button"><strong>Ask me!</strong></button>
export function buttonTag(content, options) {
    var tmp;

    // Handle `content, options` && `options` style arguments
    if (typeof content === 'object') {
        tmp = options;
        options = content;
        content = tmp;
    } else if (options === undefined) {
        options = {};
    }

    return contentTag('button', content, Object.assign({ type: 'button' }, options));
};

// checkBoxTag(name, value="1", checked=false, options)
// ======================================================
//
// Creates a check box form input tag.
//
// Options
// -------
//      - disabled: If true, the user will not be able to use this input.
//      - Any other key creates standard HTML attributes for the tag
//
// Examples
// --------
//   checkBoxTag('accept')
//   // => <input name="accept" type="checkbox" value="1" />
//   
//   checkBoxTag('rock', 'rock music')
//   // => <input name="rock" type="checkbox" value="rock music" />
//   
//   checkBoxTag('receive_email', 'yes', true)
//   // => <input checked="checked" name="receive_email" type="checkbox" value="yes" />
//   
//   checkBoxTag('tos', 'yes', false, class: 'accept_tos')
//   // => <input class="accept_tos" name="tos" type="checkbox" value="yes" />
//   
//   checkBoxTag('eula', 'accepted', false, disabled: true)
//   // => <input disabled="disabled" name="eula" type="checkbox" value="accepted" />
//
// export function checkBoxTag(name: string, value: string = '1', checked: boolean, options: any = {})
export function checkBoxTag(name, value = '1', checked, options = {}) {

    if (checked) {
        options.checked = true;
    }

    return tag("input", Object.assign({
        type: "checkbox",
        value: value,
        id: sanitizeToId(name),
        name: name
    }, options));
};

// labelTag(content, options)
// ========================================================
//
// Creates a label element. Accepts a block.
//
// Options - Creates standard HTML attributes for the tag.
//
// Examples
// --------
//   labelTag('Name')
//   // => <label>Name</label>
//   
//   labelTag('name', 'Your name')
//   // => <label for="name">Your name</label>
//   
//   labelTag('name', nil, {for: 'id'})
//   // => <label for="name" class="small_label">Name</label>
//
// export function labelTag(content, options)
export function labelTag(content, options) {
    var tmp;

    if (typeof options === 'function') {
        tmp = content;
        content = options;
        options = tmp;
    }

    return contentTag('label', content, options);
};

// textFieldTag(name, [value], [options])
// ======================================
//
// Creates a standard text field. Returns the duplicated String.
//
// Arguments
// ---------
// name:    The name of the input
// value:   The value of the input
// options: A object with any of the following:
//      - disabled: If set to true, the user will not be able to use this input
//      - size: The number of visible characters that will fit in the input
//      - maxlength: The maximum number of characters that the browser will
//                   allow the user to enter
//      - placehoder: The text contained in the field by default, which is
//                    removed when the field receives focus
//      - Any other key creates standard HTML attributes for the tag
//
// Examples
// --------
//
//   textFieldTag('name')
//   // => <input name="name" type="text" />
//   
//   textFieldTag('query', 'Enter your search')
//   // => <input name="query" value="Enter your search" type="text" />
//   
//   textFieldTag('search', {placeholder: 'Enter search term...'})
//   // => <input name="search" placeholder="Enter search term..." type="text" />
//   
//   textFieldTag('request', {class: 'special_input'})
//   // => <input class="special_input" name="request" type="text" />
//   
//   textFieldTag('address', '', {size: 75})
//   // => <input name="address" size="75" value="" type="text" />
//   
//   textFieldTag('zip', {maxlength: 5})
//   // => <input maxlength="5" name="zip" type="text" />
//   
//   textFieldTag('payment_amount', '$0.00', {disabled: true})
//   // => <input disabled="disabled" name="payment_amount" value="$0.00" type="text" />
//   
//   textFieldTag('ip', '0.0.0.0', {maxlength: 15, size: 20, class: "ip-input"})
//   // => <input class="ip-input" maxlength="15" name="ip" size="20" value="0.0.0.0" type="text" />
//
// export function textFieldTag(name: string, value: any, options)
export function textFieldTag(name, value, options) {

    // Handle both `name, value` && `name, options` style arguments
    if (value !== null && typeof value === 'object' && !(value instanceof Model)) {
        options = value;
        value = undefined;
    }

    return tag('input', Object.assign({
        "type": 'text',
        "id": sanitizeToId(name),
        "name": name,
        "value": value
    }, options));

};

// hiddenFieldTag(name, value = nil, options = {})
// ===============================================
//
// Creates a hidden form input field used to transmit data that would be lost
// due to HTTP's statelessness or data that should be hidden from the user.
//
// Options
// -------
//      - Any key creates standard HTML attributes for the tag
//
// Examples
// --------
//   hiddenFieldTag('tags_list')
//   // => <input name="tags_list" type="hidden">
//   
//   hiddenFieldTag('token', 'VUBJKB23UIVI1UU1VOBVI@')
//   // => <input name="token" type="hidden" value="VUBJKB23UIVI1UU1VOBVI@">
//
// export function hiddenFieldTag(name: string, value: string, options: any = {})
export function hiddenFieldTag(name, value, options = {}) {
    return textFieldTag(name, value, Object.assign({
        id: null,
        type: "hidden"
    }, options));
};


// formTag([options], [content])
// formTag([content], [options])
// =============================
//
// ==== Options
// * <tt>:action</tt> - The url the action of the form should be set to.
// * <tt>:multipart</tt> - If set to true, the enctype is set to "multipart/form-data".
// * <tt>:method</tt> - The method to use when submitting the form, usually either "get" or "post".
//   If "patch", "put", "delete", or another verb is used, a hidden input with name <tt>_method</tt>
//   is added to simulate the verb over post. The default is "POST". Only set if
//   :action is passed as an option.
//
// ==== Examples
//   formTag();
//   // => <form>
//
//   formTag({action: '/posts'});
//   // => <form action="/posts" method="post">
//
//   formTag({action: '/posts/1', method: "put"});
//   // => <form action="/posts/1" method="post"><input name="_method" type="hidden" value="put" />
//
//   formTag({action: '/upload', multipart: true});
//   // => <form action="/upload" method="post" enctype="multipart/form-data">
//
//   formTag({action: '/posts'}, function() {
//      return submitTag('Save');
//   });
//   // => <form action="/posts" method="post"><input type="submit" name="commit" value="Save" /></form>
export function formTag(options, content) {
    var tmp, methodOverride = '';

    if (typeof options === 'function' || typeof options === 'string') {
        tmp = content;
        content = options;
        options = tmp;
    }
    var formOptions = Object.assign({}, options);

    if (options && options.multipart) {
        formOptions.enctype = "multipart/form-data";
        delete formOptions.multipart;
    }
    
    if (options && options.action && !options.method) {
        formOptions.method = 'post';
    } else if (options && options.method && options.method !== 'get' && options.method !== 'post') {
        formOptions.method = 'post';
    }

    var el = contentTag('form', content, formOptions);
    
    if (options && options.method && options.method !== 'get' && options.method !== 'post') {
        el.prepend(hiddenFieldTag('_method', options.method));
    }

    return el;
};

// submitTag(value="Save", options)
// =================================
//
// Creates a submit button with the text value as the caption.
//
// Options
// -------
//    - disabled:      If set to true, the user will not be able to use this input.
//    - Any other key creates standard HTML attributes for the tag.
//   
//   submitTag()
//   // => <input name="commit" type="submit" value="Save">
//   
//   submitTag "Edit this article"
//   // => <input name="commit" type="submit" value="Edit this article">
//   
//   submitTag("Save edits", {disabled: true})
//   // => <input disabled name="commit" type="submit" value="Save edits">
//   
//   submitTag(nil, {class: "form_submit"})
//   // => <input class="form_submit" name="commit" type="submit">
//   
//   submitTag("Edit", class: "edit_button")
//   // => <input class="edit_button" name="commit" type="submit" value="Edit">
//
// export function submitTag(value: string | null, options: any = {})
export function submitTag(value, options = {}) {
    if (!value) { value = 'Save'; }

    return tag('input', Object.assign({
        type: 'submit',
        name: 'commit',
        id: null,
        value: value
    }, options));
};

// numberFieldTag(name, value = nil, options = {})
// ===============================================
// 
// Creates a number field.
//
// Options
// -------
//      - min:  The minimum acceptable value.
//      - max:  The maximum acceptable value.
//      - step: The acceptable value granularity.
//      - Otherwise accepts the same options as text_field_tag.
//
// Examples
// --------
//   
//   numberFieldTag('count')
//   // => <input name="count" type="number">
//   
//   nubmerFieldTag('count', 10)
//   // => <input" name="count" type="number" value="10">
//   
//   numberFieldTag('count', 4, {min: 1, max: 9})
//   // => <input min="1" max="9" name="count" type="number" value="4">
//   
//   numberFieldTag('count', {step: 25})
//   # => <input name="count" step="25" type="number">
//
// export function numberFieldTag(name: string, value, options)
export function numberFieldTag(name, value, options) {

    // Handle both `name, value, options`, and `name, options` syntax
    if (typeof value === 'object') {
        options = value;
        value = undefined;
    }

    options = Object.assign({ type: 'number' }, options);
    if (value) { options.value = value; }

    return textFieldTag(name, value, options);
};

// radioButtonTag(name, value, checked, options)
// =============================================
//
// Creates a radio button; use groups of radio buttons named the same to allow
// users to select from a group of options.
//
// Options
// -------
//      - disabled: If true, the user will not be able to use this input.
//      - Any other key creates standard HTML attributes for the tag
//
// Examples
// --------
//   radioButtonTag('gender', 'male')
//   // => <input name="gender" type="radio" value="male">
//   
//   radioButtonTag('receive_updates', 'no', true)
//   // => <input checked="checked" name="receive_updates" type="radio" value="no">
//
//   radioButtonTag('time_slot', "3:00 p.m.", false, {disabled: true})
//   // => <input disabled name="time_slot" type="radio" value="3:00 p.m.">
//   
//   radioButtonTag('color', "green", true, {class: "color_input"})
//   // => <input checked class="color_input" name="color" type="radio" value="green">
//
// export function radioButtonTag(name: string, value, checked?: boolean, options: any = {})
export function radioButtonTag(name, value, checked, options = {}) {
    if (checked === true) { options.checked = true; }

    return tag("input", Object.assign({
        type: "radio",
        value: value,
        name: name,
        id: sanitizeToId(name)
    }, options));
};

// passwordFieldTag(name = "password", value = nil, options = {})
// ================================================================
// 
// Creates a password field, a masked text field that will hide the users input
// behind a mask character.
//
// Options
// -------
//      - disabled:  If true, the user will not be able to use this input.
//      - size:      The number of visible characters that will fit in the input.
//      - maxlength: The maximum number of characters that the browser will allow the user to enter.
//      - Any other key creates standard HTML attributes for the tag
//
// Examples
// --------
//   
//   passwordFieldTag('pass')
//   // => <input name="pass" type="password">
//   
//   passwordFieldTag('secret', 'Your secret here')
//   // => <input" name="secret" type="password" value="Your secret here">
//   
//   passwordFieldTag('masked', nil, {class: 'masked_input_field'})
//   // => <input class="masked_input_field" name="masked" type="password">
//   
//   passwordFieldTag('token', '', {size: 15})
//   # => <input name="token" size="15" type="password" value="">
//   
//   passwordFieldTag('key', null, {maxlength: 16})
//   // => <input maxlength="16" name="key" type="password">
//   
//   passwordFieldTag('confirm_pass', null, {disabled: true})
//   // => <input disabled name="confirm_pass" type="password">
//   
//   passwordFieldTag('pin', '1234', {maxlength: 4, size: 6, class: "pin_input"})
//   // => <input class="pin_input" maxlength="4" name="pin" size="6" type="password" value="1234">
//
// export function passwordFieldTag(name: string = 'password', value: string | null = null, options: any = {})
export function passwordFieldTag(name = 'password', value = null, options = {}) {
    return textFieldTag(name, value, Object.assign({
        type: 'password'
    }, options));
};

// timeTag(date, [options], [value])
// =================================
//
// Returns an html time tag for the given date or time.
//
// Examples
// --------
//
//   timeTag(Date.today)
//   // => <time datetime="2010-11-04">November 04, 2010</time>
//
//   timeTag(Date.now)
//   // => <time datetime="2010-11-04T17:55:45+01:00">November 04, 2010 17:55</time>
//
//   timeTag(Date.yesterday, 'Yesterday')
//   // => <time datetime="2010-11-03">Yesterday</time>
//
//   timeTag(Date.today, {pubdate: true})
//   // => <time datetime="2010-11-04" pubdate="pubdate">November 04, 2010</time>
//
//   timeTag(Date.today, {datetime: Date.today.strftime('%G-W%V')})
//   // => <time datetime="2010-W44">November 04, 2010</time>
//
//   time_tag(Date.now, function() {
//     return '<span>Right now</span>';
//   });
//   // => <time datetime="2010-11-04T17:55:45+01:00"><span>Right now</span></time>
export function timeTag(date, content, options) {
    var tmp;

    // handle both (date, opts, func || str) and (date, func || str, opts)
    if (typeof content === 'object') {
        tmp = options;
        options = content;
        content = tmp;
    }
    options || (options = {});

    if (!content) {
        // content = options.format ? strftime(date, options.format) : date.toString();
        content = date.toString();
    }
    if (options.format) { delete options.format; }
    if (!options.datetime) { options.datetime = date.toISOString(); }


    return contentTag('time', content, options);
};

// textAreaTag(name, [content], [options]
// ======================================
//
// Creates a text input area; use a textarea for longer text inputs such as
// blog posts or descriptions.
//
// Options
// -------
//    - size: A string specifying the dimensions (columns by rows) of the textarea (e.g., "25x10").
//    - rows: Specify the number of rows in the textarea
//    - cols: Specify the number of columns in the textarea
//    - disabled: If set to true, the user will not be able to use this input.
//    - Any other key creates standard HTML attributes for the tag.
//
// Examples
// --------
//   
//   textAreaTag('post')
//   // => <textarea name="post"></textarea>
//   
//   textAreaTag('bio', user.bio)
//   // => <textarea name="bio">This is my biography.</textarea>
//   
//   textAreaTag('body', null, {rows: 10, cols: 25})
//   // => <textarea cols="25" name="body" rows="10"></textarea>
//   
//   textAreaTag('body', null, {size: "25x10"})
//   // => <textarea name="body" cols="25" rows="10"></textarea>
//   
//   textAreaTag('description', "Description goes here.", {disabled: true})
//   // => <textarea disabled name="description">Description goes here.</textarea>
//   
//   textAreaTag('comment', null, {class: 'comment_input'})
//   // => <textarea class="comment_input" name="comment"></textarea>
//
// export function textAreaTag(name, content, options: any = {})
export function textAreaTag(name, content, options = {}) {
    options = Object.assign({
        id: sanitizeToId(name),
        name: name
    }, options);

    if (options.size) {
        options.cols = options.size.split('x')[0];
        options.rows = options.size.split('x')[1];
        delete options.size;
    }

    return contentTag('textarea', content, options, false);
};

// optionsForSelectTag(container[, selected])
// =======================================
//
// Accepts a container (hash, array, collection, your type) and returns a
// string of option tags. Given a container where the elements respond to
// first and last (such as a two-element array), the "lasts" serve as option
// values and the "firsts" as option text. Hashes are turned into this
// form automatically, so the keys become "firsts" and values become lasts.
// If +selected+ is specified, the matching "last" or element will get the
// selected option-tag. +selected+ may also be an array of values to be
// selected when using a multiple select.
//
//   optionsForSelectTag([["Dollar", "$"], ["Kroner", "DKK"]])
//   // => <option value="$">Dollar</option>
//   // => <option value="DKK">Kroner</option>
//
//   optionsForSelectTag([ "VISA", "MasterCard" ], "MasterCard")
//   // => <option>VISA</option>
//   // => <option selected>MasterCard</option>
//
//   optionsForSelectTag({ "Basic" => "$20", "Plus" => "$40" }, "$40")
//   // => <option value="$20">Basic</option>
//   // => <option value="$40" selected>Plus</option>
//
//   optionsForSelectTag([ "VISA", "MasterCard", "Discover" ], ["VISA", "Discover"])
//   // => <option selected>VISA</option>
//   // => <option>MasterCard</option>
//   // => <option selected>Discover</option>
//
// You can optionally provide html attributes as the last element of the array.
//
//   optionsForSelectTag([ "Denmark", ["USA", {class: 'bold'}], "Sweden" ], ["USA", "Sweden"])
//   // => <option value="Denmark">Denmark</option>
//   // => <option value="USA" class="bold" selected>USA</option>
//   // => <option value="Sweden" selected>Sweden</option>
//
//   optionsForSelectTag([["Dollar", "$", {class: "bold"}], ["Kroner", "DKK", {class: "alert"}]])
//   // => <option value="$" class="bold">Dollar</option>
//   // => <option value="DKK" class="alert">Kroner</option>
//
// If you wish to specify disabled option tags, set +selected+ to be a hash,
// with <tt>:disabled</tt> being either a value or array of values to be
// disabled. In this case, you can use <tt>:selected</tt> to specify selected
// option tags.
//
//   optionsForSelectTag(["Free", "Basic", "Advanced", "Super Platinum"], {disabled: "Super Platinum"})
//   // => <option value="Free">Free</option>
//   // => <option value="Basic">Basic</option>
//   // => <option value="Advanced">Advanced</option>
//   // => <option value="Super Platinum" disabled>Super Platinum</option>
//
//   optionsForSelectTag(["Free", "Basic", "Advanced", "Super Platinum"], {disabled: ["Advanced", "Super Platinum"]})
//   // => <option value="Free">Free</option>
//   // => <option value="Basic">Basic</option>
//   // => <option value="Advanced" disabled>Advanced</option>
//   // => <option value="Super Platinum" disabled>Super Platinum</option>
//
//   optionsForSelectTag(["Free", "Basic", "Advanced", "Super Platinum"], {selected: "Free", disabled: "Super Platinum"})
//   // => <option value="Free" selected>Free</option>
//   // => <option value="Basic">Basic</option>
//   // => <option value="Advanced">Advanced</option>
//   // => <option value="Super Platinum" disabled>Super Platinum</option>
//
// NOTE: Only the option tags are returned, you have to wrap this call in a
// regular HTML select tag.
function arrayWrap(data) {
    return Array.isArray(data) ? data : [data];
}

export function optionsForSelectTag(container, selected) {
    var disabled = [];

    if (typeof selected !== 'object' && typeof selected !== 'function') {
        selected = arrayWrap(selected);
    } else if (!Array.isArray(selected) && typeof selected !== 'function') {
        disabled = typeof selected.disabled === 'function' ? selected.disabled : arrayWrap(selected.disabled);
        selected = typeof selected.selected === 'function' ? selected.selected : arrayWrap(selected.selected);
    }

    if (Array.isArray(container)) {
        return container.map((text) => {
            let value;
            let options = {};

            if (Array.isArray(text)) {
                if (typeof last(text) === 'object') { options = text.pop(); }
                if (text.length === 2) {
                    options.value = value = text[1];
                    text = text[0];
                } else {
                    value = text = text[0];
                }
            } else {
                value = text;
            }

            if (selected) {
                if (typeof selected === 'function') {
                    if (selected(value)) { options.selected = true; }
                } else if (selected.includes(value)) {
                    options.selected = true;
                }
            }

            if (disabled) {
                if (typeof disabled === 'function') {
                    if (disabled(value)) { options.disabled = true; }
                } else if (disabled.includes(value)) {
                    options.disabled = true;
                }
            }

            return contentTag('option', text, options);
        });
    }

    return Object.keys(container).map((text) => {
        let value = container[text];
        
        var options = { value: value };

        if (selected) {
            if (typeof selected === 'function') {
                if (selected(value)) { options.selected = true; }
            } else if (selected.includes(value)) {
                options.selected = true;
            }
        }
        
        if (disabled) {
            if (typeof disabled === 'function') {
                if (disabled(value)) { options.disabled = true; }
            } else if (disabled.includes(value)) {
                options.disabled = true;
            }
        }

        return contentTag('option', text, options);
    });
};

// optionsFromCollectionForSelectTag(collection, valueMethod, textMethod, selected)
// =============================================================================
//
// Returns a string of option tags that have been compiled by iterating over
// the collection and assigning the result of a call to the valueMethod as
// the option value and the textMethod as the option text.
//
//   optionsFromCollectionForSelectTag(people, 'id', 'name')
//   // => <option value="person's id">person's name</option>
//
// This is more often than not used inside a selectTag like this example:
//
//   selectTag(person, optionsFromCollectionForSelectTag(people, 'id', 'name'))
//
// If selected is specified as a value or array of values, the element(s)
// returning a match on valueMethod will be selected option tag(s).
//
// If selected is specified as a Proc, those members of the collection that
// return true for the anonymous function are the selected values.
//
// selected can also be a hash, specifying both :selected and/or :disabled
// values as required.
//
// Be sure to specify the same class as the valueMethod when specifying
// selected or disabled options. Failure to do this will produce undesired
// results. Example:
//
//   optionsFromCollectionForSelectTag(people, 'id', 'name', '1')
//
// Will not select a person with the id of 1 because 1 (an Integer) is not
// the same as '1' (a string)
//
//   optionsFromCollectionForSelectTag(people, 'id', 'name', 1)
//
// should produce the desired results.
export function optionsFromCollectionForSelectTag(collection, valueAttribute, textAttribute, selected) {
    var selectedForSelect;

    var options = collection.map(function (model) {
        return [methodOrAttribute(model, textAttribute), methodOrAttribute(model, valueAttribute)];
    });

    if (Array.isArray(selected)) {
        selectedForSelect = selected;
    } else if (typeof selected === 'object') {
        selectedForSelect = {
            selected: selected.selected,
            disabled: selected.disabled
        };
    } else {
        selectedForSelect = selected;
    }

    return optionsForSelectTag(options, selectedForSelect);
};





// selectTag(name, optionTags, options)
// ====================================
//
// Creates a dropdown selection box, or if the :multiple option is set to true,
// a multiple choice selection box.
//
// Options
// -------
//    - multiple:      If set to true the selection will allow multiple choices.
//    - disabled:      If set to true, the user will not be able to use this input.
//    - includeBlank:  If set to true, an empty option will be created, can pass a string to use as empty option content
//    - prompt:        Create a prompt option with blank value and the text asking user to select something
//    - Any other key creates standard HTML attributes for the tag.
//
// Examples
// --------
//   selectTag("people", options_for_select({ "Basic": "$20"}))
//   // <select name="people"><option value="$20">Basic</option></select>
//   
//   selectTag("people", "<option>David</option>")
//   // => <select name="people"><option>David</option></select>
//   
//   selectTag("count", "<option>1</option><option>2</option><option>3</option>")
//   // => <select name="count"><option>1</option><option>2</option><option>3</option></select>
//   
//   selectTag("colors", "<option>Red</option><option>Green</option><option>Blue</option>", {multiple: true})
//   // => <select multiple="multiple" name="colors[]"><option>Red</option>
//   //    <option>Green</option><option>Blue</option></select>
//   
//   selectTag("locations", "<option>Home</option><option selected='selected'>Work</option><option>Out</option>")
//   // => <select name="locations"><option>Home</option><option selected='selected'>Work</option>
//   //    <option>Out</option></select>
//   
//   selectTag("access", "<option>Read</option><option>Write</option>", {multiple: true, class: 'form_input'})
//   // => <select class="form_input" multiple="multiple" name="access[]"><option>Read</option>
//   //    <option>Write</option></select>
//   
//   selectTag("people", options_for_select({ "Basic": "$20"}), {includeBlank: true})
//   // => <select name="people"><option value=""></option><option value="$20">Basic</option></select>
//   
//   selectTag("people", options_for_select({"Basic": "$20"}), {prompt: "Select something"})
//   // => <select name="people"><option value="">Select something</option><option value="$20">Basic</option></select>
//   
//   selectTag("destination", "<option>NYC</option>", {disabled: true})
//   // => <select disabled name="destination"><option>NYC</option></select>
//   
//   selectTag("credit_card", options_for_select([ "VISA", "MasterCard" ], "MasterCard"))
//   // => <select name="credit_card"><option>VISA</option><option selected>MasterCard</option></select>
//
// export function selectTag(name: string, optionTags, options)
export function selectTag(name, optionTags, options) {
    var tagName = name;
    if (options === undefined) { options = {}; }
    if (options.multiple && tagName.slice(-2) !== "[]") { tagName = tagName + "[]"; }
    options = Object.assign({
        id: sanitizeToId(name),
        name: tagName
    }, options);

    if (options.includeBlank) {
        var content = typeof options.includeBlank == "string" ? options.includeBlank : "";
        optionTags = contentTag('option', content, { value: '' }) + optionTags;
        delete options.includeBlank;
    }

    if (options.prompt) {
        if (options.prompt === true) { options.prompt = 'Select'; }
        optionTags = [contentTag('option', options.prompt, { value: '' })] + optionTags;
        delete options.prompt;
    }

    return contentTag('select', optionTags, options, false);
};

// colorFieldTag(name, value = nil, options = {})
// ===============================================
// 
// Creates a color field.
//
// Options
// -------
//      - Accepts the same options as text_field_tag.
//
// Examples
// --------
//   
//   colorFieldTag('accent')
//   // => <input name="accent" type="color">
//   
//   colorFieldTag('accent', "#FFFFFF")
//   // => <input" name="accent" type="color" value="#FFFFFF">
//
// export function colorFieldTag(name: string, value, options)
export function colorFieldTag(name, value, options) {

    // Handle both `name, value, options`, and `name, options` syntax
    if (typeof value === 'object') {
        options = value;
        value = undefined;
    }

    options = _.extend({ type: 'color' }, options);
    if (value) { options.value = value; }

    return textFieldTag(name, value, options);
};