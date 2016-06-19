import { checkBoxTag } from '../form_tag_helpers/check_box_tag';
import { label } from '../form_helpers/label';
import { tagNameForModelAttribute, sanitizeToId,  } from '../utils';

export function CheckBoxGroupBuilder(model, attribute, options) {
    let modelName;
    options = _.extend({}, options);
    
    this.model = model;
    this.attribute = attribute;
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

// TODO: options passed to the helpers can be made into a helper
CheckBoxGroupBuilder.prototype = {

    checkBox: function(checkedValue, options) {
        let values = this.model.get(this.attribute);
        options || (options = {});
        
        if (!options.name && this.options.namespace) {
            options.name = tagNameForModelAttribute(this.model, this.attribute, {namespace: this.options.namespace});
        } else if (!options.name) {
            options.name = tagNameForModelAttribute(this.model, this.attribute);
        }
        
        if (!options.id) {
            options.id = sanitizeToId(options.name) + '_' + checkedValue;
        }
        
        return checkBoxTag(options.name, checkedValue, _.contains(values, checkedValue), options);
    },
    
    label: function(value, content, options, escape) {
        options || (options = {});
        
        //TODO shouldn't options.name be options.for?
        if (!options.name && !options['for']) {
            options['for'] = tagNameForModelAttribute(this.model, this.attribute, {namespace: this.options.namespace});
            options['for'] = sanitizeToId(options['for']) + '_' + value;
        }
        
        return label(this.model, this.attribute, content, options, escape);
    }
    
};

export default CheckBoxGroupBuilder;