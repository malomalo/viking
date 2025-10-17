import { checkBoxTag, sanitizeToId, tagNameForModelAttribute } from '../helpers/tagHelpers.js';
import { label } from '../helpers/formHelpers.js';

export default class CheckBoxGroupBuilder {

    model;//: any
    attribute;//: string;
    options;//: any;

    // constructor(model: any, attribute: string, options)
    constructor(model, attribute, options) {
        var modelName;
        options = _.extend({}, options);

        this.model = model;
        this.attribute = attribute;
        this.options = options;

        modelName = _.has(options, 'as') ? options.as : this.model.baseClass.modelName.paramKey;
        if (options.namespace) {
            if (options.as !== null && options.namespace.indexOf(modelName) == -1) {
                this.options.namespace = options.namespace + '[' + modelName + ']';
            }
        } else {
            this.options.namespace = modelName;
        }
    }

    // checkBox(checkedValue, options: any = {})
    checkBox(checkedValue, options = {}) {
        let values = this.model.get(this.attribute);

        if (!options.name && this.options.namespace) {
            options.name = tagNameForModelAttribute(this.model, this.attribute, { namespace: this.options.namespace });
        } else if (!options.name) {
            options.name = tagNameForModelAttribute(this.model, this.attribute);
        }

        if (!options.id) {
            options.id = sanitizeToId(options.name) + '_' + checkedValue;
        }

        return checkBoxTag(options.name, checkedValue, _.contains(values, checkedValue), options);
    }

    // label(value, content, options: any = {}, escape?)
    label(value, content, options = {}, escape) {
        //TODO shouldn't options.name be options.for?
        if (!options.name && !options['for']) {
            options['for'] = tagNameForModelAttribute(this.model, this.attribute, { namespace: this.options.namespace });
            options['for'] = sanitizeToId(options['for']) + '_' + value;
        }

        return label(this.model, this.attribute, content, options, escape);
    }

}