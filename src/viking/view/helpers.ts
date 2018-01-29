//= require_self
//= require viking/view/helpers/form_tag_helpers
//= require viking/view/helpers/builders
//= require viking/view/helpers/date_helpers
//= require viking/view/helpers/form_helpers
//= require viking/view/helpers/url_helpers
//= require viking/view/helpers/asset_helpers
//= require viking/view/helpers/render_helper
import * as _ from 'underscore';
import * as Backbone from 'backbone'

import { Collection } from '../collection';

const booleanAttributes = ['disabled', 'readonly', 'multiple', 'checked',
    'autobuffer', 'autoplay', 'controls', 'loop', 'selected', 'hidden',
    'scoped', 'async', 'defer', 'reversed', 'ismap', 'seemless', 'muted',
    'required', 'autofocus', 'novalidate', 'formnovalidate', 'open',
    'pubdate', 'itemscope'];

export const Helpers = {

    tagOption: function (key, value, escape) {
        if (_.isArray(value)) { value = value.join(" "); }
        if (escape) { value = _.escape(value); }

        return key + '="' + value + '"';
    },

    dataTagOption: function (key, value, escape): string {
        key = "data-" + key;
        if (_.isObject(value)) { value = JSON.stringify(value); }

        return Helpers.tagOption(key, value, escape);
    },

    tagOptions: function (options, escape) {
        if (options === undefined) { return ""; }
        if (escape === undefined) { escape = true; }

        var attrs: string[] = [];
        _.each(options, function (value: any, key: string) {
            if (key === "data" && _.isObject(value)) {
                // TODO testme
                _.each(value, function (value, key) {
                    attrs.push(Helpers.dataTagOption(key, value, escape));
                });
            } else if (value === true && _.contains(booleanAttributes, key)) {
                attrs.push(key);
            } else if (value !== null && value !== undefined) {
                attrs.push(Helpers.tagOption(key, value, escape));
            }
        });

        if (attrs.length === 0) {
            return '';
        }

        return " " + attrs.sort().join(' ');
    },

    // see http://www.w3.org/TR/html4/types.html#type-name
    sanitizeToId: function (name) {
        return name.replace(/[^\-a-zA-Z0-9:.]/g, "_").replace(/_+/g, '_').replace(/_+$/, '').replace(/_+/g, '_');
    },

    // TODO: move to model_helpers?
    tagNameForModelAttribute: function (model, attribute, options) {
        options || (options = {});

        var value = model.get(attribute);
        var name;

        if (options.namespace) {
            name = options.namespace + '[' + attribute + ']';
        } else {
            name = model.baseModel.modelName.paramKey + '[' + attribute + ']';
        }

        if (value instanceof Collection || _.isArray(value)) {
            name = name + '[]';
        }

        return name;
    },

    // TODO: move to model_helpers?
    addErrorClassToOptions: function (model, attribute, options) {
        if (model.errorsOn(attribute)) {
            if (options['class']) {
                options['class'] = options['class'] + ' error';
            } else {
                options['class'] = 'error';
            }
        }
    },

    // TODO: move to model_helpers?
    // TODO: testme
    methodOrAttribute: function (model, funcOrAttribute) {
        if (typeof funcOrAttribute !== 'function') {
            if (model[funcOrAttribute]) {
                return _.result(model, funcOrAttribute);
            }

            return model.get(funcOrAttribute);
        }

        return funcOrAttribute(model);
    },

    render: function (templatePath, locals) {
        var template = Helpers.templates[templatePath];

        if (!locals) {
            locals = {};
        }

        if (template) {
            return template(_.extend(locals, Helpers));
        }

        throw new Error('Template does not exist: ' + templatePath);
    }
}
