import Name from '../name';
import { global } from '../../global';
import { Reflection } from '../reflection';
import { ArgumentError } from '../../errors';

// Overide the default extend method to support passing in the modelName
// and support STI
//
// The modelName is used for generating urls and relationships.
//
// If a Model is extended further is acts simlar to ActiveRecords STI.
//
// `name` is optional, and must be a string
export const extend = function(name, protoProps, staticProps) {
    // if (typeof name !== 'string' || arguments.length < 1 || arguments.length > 3) {
    //     throw new ArgumentError('extend takes 1 - 3 arguments (name: String, protoProps: Object, staticProps: Object?)');
    // }

    protoProps || (protoProps = {});

    let child = Backbone.Model.extend.call(this, protoProps, staticProps);

    if (typeof name === 'string') {
        child.modelName = new Name(name);
    }

    child.associations = {};
    child.descendants = [];
    child.inheritanceAttribute = (protoProps.inheritanceAttribute === undefined) ? this.prototype.inheritanceAttribute : protoProps.inheritanceAttribute;

    if (child.inheritanceAttribute === false || (this.prototype.hasOwnProperty('abstract') && this.prototype.abstract)) {
        child.baseModel = child;
    } else {
        child.baseModel.descendants.push(child);
    }

    ['belongsTo', 'hasOne', 'hasMany', 'hasAndBelongsToMany'].forEach(function(macro) {
        (protoProps[macro] || []).concat(this[macro] || []).forEach(function(name) {
            let options;

            // Handle both `type, key, options` and `type, [key, options]` style arguments
            if (Array.isArray(name)) {
                options = name[1];
                name = name[0];
            }

            if (!child.associations[name]) {
                let reflectionClass = {
                    'belongsTo': Reflection.BelongsTo,
                    'hasOne': Reflection.HasOne,
                    'hasMany': Reflection.HasMany,
                    'hasAndBelongsToMany': Reflection.HasAndBelongsToMany
                }
                reflectionClass = reflectionClass[macro];

                child.associations[name] = new reflectionClass(name, options);
            }
        });
    }, this.prototype);

    if (this.prototype.schema && protoProps.schema) {
        Object.keys(this.prototype.schema).forEach( (key) => {
            if(!child.prototype.schema[key]) {
                child.prototype.schema[key] = this.prototype.schema[key];
            }
        });
    }

    // Track the model in the Viking global namespace.
    // Used in the constinize method
    if (child.modelName) {
        global[child.modelName.singular] = child;
    }

    return child;
};
