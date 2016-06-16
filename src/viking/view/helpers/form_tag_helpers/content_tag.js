import { tagOptions } from './../utils';

// contentTag(name, [content], [options], [escape=true], [&block])
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
export const contentTag = function (name, content, options, escape) {
    let tmp;

    // Handle `name, content`, `name, content, options`,
    // `name, content, options, escape`, `name, content, escape`, `name, block`,
    // `name, options, block`, `name, options, escape, block`, && `name, escape, block`
    // style arguments
    if (typeof content === "boolean") {
        escape = content;
        content = options;
        options = undefined;
    } else if (typeof content === 'object') {
        if (typeof options === 'function') {
            tmp = options;
            options = content;
            content = tmp;
        } else if (typeof options === 'boolean') {
            tmp = content;
            content = escape;
            escape = options;
            options = tmp;
        }
    } else if (typeof options === 'boolean') {
        escape = options;
        options = undefined;
    }
    if (typeof content === 'function') {
        content = content();
    }
    if (escape || escape === undefined) {
        content = _.escape(content);
    }

    return "<" + name + tagOptions(options, escape) + ">" + content + "</" + name + ">";
};

export default contentTag;