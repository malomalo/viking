import Model from 'viking/model';

import { sanitizeToId, tagNameForModelAttribute } from '../index';
import {
    collectionSelect,
    hiddenField,
    label,
    numberField,
    colorField,
    moneyField,
    passwordField,
    radioButton,
    select,
    textArea,
    textField,
    checkBoxGroup,
    checkBox
} from '../formHelpers';

export class FormBuilder {

    model: any;
    options: any;

    // constructor(model: any, options: any)
    constructor(model, options) {
        let modelName;

        options = Object.assign({}, options);

        this.model = model;
        this.options = options;

        modelName = _.has(options, 'as') ? options.as : this.model.baseModel.modelName.paramKey;

        if (options.namespace) {
            if (options.as !== null) {
                this.options.namespace = options.namespace + '[' + modelName + ']';
            }
        } else {
            this.options.namespace = modelName;
        }
    }

    checkBox(attribute, options, checkedValue, uncheckedValue, escape) {
        options || (options = {});

        if (!options.name && this.options.namespace) {
            options.name = tagNameForModelAttribute(this.model, attribute, { namespace: this.options.namespace });
        }

        return checkBox(this.model, attribute, options, checkedValue, uncheckedValue, escape);
    }

    collectionSelect(attribute, collection, valueAttribute, textAttribute, options) {
        options || (options = {});

        if (!options.name && this.options.namespace) {
            options.name = tagNameForModelAttribute(this.model, attribute, { namespace: this.options.namespace });
        }

        return collectionSelect(this.model, attribute, collection, valueAttribute, textAttribute, options);
    }

    hiddenField(attribute, options) {
        options || (options = {});

        if (!options.name && this.options.namespace) {
            options.name = tagNameForModelAttribute(this.model, attribute, { namespace: this.options.namespace });
        }

        return hiddenField(this.model, attribute, options);
    }

    label(attribute, content, options, escape) {
        options || (options = {});

        //TODO shouldn't options.name be options.for?
        if (!options['for'] && !options.name && this.options.namespace) {
            options['for'] = tagNameForModelAttribute(this.model, attribute, { namespace: this.options.namespace });
            options['for'] = sanitizeToId(options['for']);
        }

        return label(this.model, attribute, content, options, escape);
    }

    number(attribute, options) {
        options || (options = {});

        if (!options.name && this.options.namespace) {
            options.name = tagNameForModelAttribute(this.model, attribute, { namespace: this.options.namespace });
        }

        return numberField(this.model, attribute, options);
    }

    color(attribute, options) {
        options || (options = {});

        if (!options.name && this.options.namespace) {
            options.name = tagNameForModelAttribute(this.model, attribute, { namespace: this.options.namespace });
        }

        return colorField(this.model, attribute, options);
    }

    money(attribute, options) {
        options || (options = {});

        if (!options.name && this.options.namespace) {
            options.name = tagNameForModelAttribute(this.model, attribute, { namespace: this.options.namespace });
        }

        return moneyField(this.model, attribute, options);
    }

    passwordField(attribute, options) {
        options || (options = {});

        if (!options.name && this.options.namespace) {
            options.name = tagNameForModelAttribute(this.model, attribute, { namespace: this.options.namespace });
        }

        return passwordField(this.model, attribute, options);
    }

    radioButton(attribute, tagValue, options) {
        options || (options = {});

        if (!options.name && this.options.namespace) {
            options.name = tagNameForModelAttribute(this.model, attribute, { namespace: this.options.namespace });
        }

        return radioButton(this.model, attribute, tagValue, options);
    }

    select(attribute, collection, options) {
        options || (options = {});

        if (!options.name && this.options.namespace) {
            options.name = tagNameForModelAttribute(this.model, attribute, { namespace: this.options.namespace });
        }

        return select(this.model, attribute, collection, options);
    }

    textArea(attribute, options) {
        options || (options = {});

        if (!options.name && this.options.namespace) {
            options.name = tagNameForModelAttribute(this.model, attribute, { namespace: this.options.namespace });
        }

        return textArea(this.model, attribute, options);
    }

    textField(attribute, options) {
        options || (options = {});

        if (!options.name && this.options.namespace) {
            options.name = tagNameForModelAttribute(this.model, attribute, { namespace: this.options.namespace });
        }

        return textField(this.model, attribute, options);
    }

    checkBoxGroup(attribute, options, content) {
        if (typeof options === 'function') {
            content = options;
            options = {};
        }

        if (!options.namespace && this.options.namespace) {
            options.namespace = this.options.namespace;
        }

        return checkBoxGroup(this.model, attribute, options, content);
    }

    fieldsFor(attribute, records, options, content) {
        var builder;

        if (records instanceof Model) {
            records = [records];
        }

        if (!_.isArray(records) && !(records instanceof Collection)) {
            content = options;
            options = records;
            records = undefined;
        }

        if (typeof options === 'function') {
            content = options;
            options = {};
        }

        if (this.model.get(attribute) instanceof Collection) {
            var superOptions = this.options;
            var parentModel = this.model;
            records || (records = this.model.get(attribute));
            if (records instanceof Collection) {
                records = records.models;
            }

            return _.map(records, function (model: any) {
                var localOptions = _.extend({ 'as': null }, options);
                if (!options.namespace) {
                    if (superOptions.namespace) {
                        localOptions.namespace = superOptions.namespace + '[' + attribute + '][' + model.cid + ']';
                    } else {
                        localOptions.namespace = parentModel.baseModel.modelName.paramKey + '[' + attribute + '][' + model.cid + ']';
                    }
                }

                builder = new FormBuilder(model, localOptions);

                if (model.id) {
                    return builder.hiddenField('id') + content(builder);
                } else {
                    return content(builder);
                }
            }).join('');
        } else {
            if (!options.namespace && this.options.namespace) {
                options.namespace = this.options.namespace;
            }
            options.as = attribute;

            builder = new FormBuilder(this.model.get(attribute), options);
            return content(builder);
        }

    }
}
