import * as _ from 'underscore';
import { Collection } from '../../collection';
import { View } from '../../view';
import { Helpers } from '../helpers';

const booleanAttributes = ['disabled', 'readonly', 'multiple', 'checked',
    'autobuffer', 'autoplay', 'controls', 'loop', 'selected', 'hidden',
    'scoped', 'async', 'defer', 'reversed', 'ismap', 'seemless', 'muted',
    'required', 'autofocus', 'novalidate', 'formnovalidate', 'open',
    'pubdate', 'itemscope'];

// tag(name, [options = {}, escape = true])
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
export function tag(name: string, options?, escape?) {
    return "<" + name + tagOptions(options, escape) + ">";
};

export function tagOption(key: string, value, escape?) {
    if (_.isArray(value)) { value = value.join(" "); }
    if (escape) { value = _.escape(value); }

    return key + '="' + value + '"';
}

export function tagOptions(options, escape) {
    if (options === undefined) { return ""; }
    if (escape === undefined) { escape = true; }

    var attrs: string[] = [];
    _.each(options, function (value: any, key: string) {
        if (key === "data" && _.isObject(value)) {
            // TODO testme
            _.each(value, function (value, key: string) {
                attrs.push(dataTagOption(key, value, escape));
            });
        } else if (value === true && _.contains(booleanAttributes, key)) {
            attrs.push(key);
        } else if (value !== null && value !== undefined) {
            attrs.push(tagOption(key, value, escape));
        }
    });

    if (attrs.length === 0) {
        return '';
    }

    return " " + attrs.sort().join(' ');
}

export function dataTagOption(key: string, value, escape?): string {
    key = "data-" + key;
    if (_.isObject(value)) { value = JSON.stringify(value); }

    return tagOption(key, value, escape);
}

// see http://www.w3.org/TR/html4/types.html#type-name
export function sanitizeToId(name: string): string {
    return name.replace(/[^\-a-zA-Z0-9:.]/g, "_").replace(/_+/g, '_').replace(/_+$/, '').replace(/_+/g, '_');
}

// TODO: move to model_helpers?
export function tagNameForModelAttribute(model, attribute, options: any = {}) {
    let value = model.get(attribute);
    let name;

    if (options.namespace) {
        name = options.namespace + '[' + attribute + ']';
    } else {
        name = model.baseModel.modelName.paramKey + '[' + attribute + ']';
    }

    if (value instanceof Collection || _.isArray(value)) {
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
            return _.result(model, funcOrAttribute);
        }

        return model.get(funcOrAttribute);
    }

    return funcOrAttribute(model);
}

export function render(templatePath, locals) {
    const template = View.templates[templatePath];

    if (!locals) {
        locals = {};
    }

    if (template) {
        return template(_.extend(locals, Helpers));
    }

    throw new Error('Template does not exist: ' + templatePath);
}
