import Name from './model/name';
import Reflection from './model/reflection';
import HasOneReflection from './model/reflections/has_one_reflection';
import HasManyReflection from './model/reflections/has_many_reflection';
import BelongsToReflection from './model/reflections/belongs_to_reflection';
import HasAndBelongsToManyReflection from './model/reflections/has_and_belongs_to_many_reflection';

// TODO: Move to 1 import
import { find } from './model/class_properties/find';
import { create } from './model/class_properties/create';
import { find_or_create_by } from './model/class_properties/find_or_create_by';
import { reflect_on_association } from './model/class_properties/reflect_on_association';
import { reflect_on_associations } from './model/class_properties/reflect_on_associations';
import { urlRoot } from './model/class_properties/urlRoot';
import { where } from './model/class_properties/where';

//= require_tree ./model/instance_properties
//= require ./model/type
//= require_tree ./model/types

// Viking.Model
// ------------
//
// Viking.Model is an extension of [Backbone.Model](http://backbonejs.org/#Model).
// It adds naming, relationships, data type coercions, selection, and modifies
// sync to work with [Ruby on Rails](http://rubyonrails.org/) out of the box.
const Model = Backbone.Model.extend({

    abstract: true,

    // inheritanceAttribute is the attirbute used for STI
    inheritanceAttribute: 'type',

    defaults: function () {
        let dflts = {};

        if (typeof(this.schema) === 'undefined') {
            return dflts;
        }

        Object.keys(this.schema).forEach( (key) => {
            if (this.schema[key]['default']) {
                dflts[key] = this.schema[key]['default'];
            }
        });

        return dflts;
    },

    // Below is the same code from the Backbone.Model function
    // except where there are comments
    constructor: function (attributes, options) {
        let attrs = attributes || {};
        options || (options = {});
        this.cid = _.uniqueId('c');
        this.attributes = {};

        attrs = _.defaults({}, attrs, _.result(this, 'defaults'));

        if (this.inheritanceAttribute) {
            if (attrs[this.inheritanceAttribute] && this.constructor.modelName.name !== attrs[this.inheritanceAttribute]) {
                // OPTIMIZE:  Mutating the [[Prototype]] of an object, no matter how
                // this is accomplished, is strongly discouraged, because it is very
                // slow and unavoidably slows down subsequent execution in modern
                // JavaScript implementations
                // Ideas: Move to Model.new(...) method of initializing models
                let type = attrs[this.inheritanceAttribute].camelize().constantize();
                this.constructor = type;
                this.__proto__ = type.prototype;
            }
        }

        // Add a helper reference to get the model name from an model instance.
        this.modelName = this.constructor.modelName;
        this.baseModel = this.constructor.baseModel;

        if (this.baseModel && this.modelName && this.inheritanceAttribute) {
            if (this.baseModel === this.constructor && this.baseModel.descendants.length > 0) {
                attrs[this.inheritanceAttribute] = this.modelName.name;
            } else if (_.contains(this.baseModel.descendants, this.constructor)) {
                attrs[this.inheritanceAttribute] = this.modelName.name;
            }
        }

        // Set up associations
        this.associations = this.constructor.associations;
        this.reflectOnAssociation = this.constructor.reflectOnAssociation;
        this.reflectOnAssociations = this.constructor.reflectOnAssociations;

        // Initialize any `hasMany` relationships to empty collections
        this.reflectOnAssociations('hasMany').forEach(function(association) {
            this.attributes[association.name] = new (association.collection())();
        }, this);

        if (options.collection) { this.collection = options.collection; }
        if (options.parse) { attrs = this.parse(attrs, options) || {}; }

        this.set(attrs, options);
        this.changed = {};
        this.initialize.call(this, attributes, options);
    }

}, {

    associations: [],

    // Overide the default extend method to support passing in the modelName
    // and support STI
    //
    // The modelName is used for generating urls and relationships.
    //
    // If a Model is extended further is acts simlar to ActiveRecords STI.
    //
    // `name` is optional, and must be a string
    extend: function(name, protoProps, staticProps) {
        if(typeof name !== 'string') {
            staticProps = protoProps;
            protoProps = name;
        }
        protoProps || (protoProps = {});

        let child = Backbone.Model.extend.call(this, protoProps, staticProps);

        if(typeof name === 'string') {
            child.modelName = new Viking.Model.Name(name);
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
                        'belongsTo': Viking.Model.BelongsToReflection,
                        'hasOne': Viking.Model.HasOneReflection,
                        'hasMany': Viking.Model.HasManyReflection,
                        'hasAndBelongsToMany': Viking.Model.HasAndBelongsToManyReflection
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

        return child;
    }

});

Model.Name = Name;
Model.Reflection = Reflection;
Model.HasOneReflection = HasOneReflection;
Model.HasManyReflection  = HasManyReflection;
Model.BelongsToReflection = BelongsToReflection;
Model.HasAndBelongsToManyReflection = HasAndBelongsToManyReflection;

Model.find = find
Model.create = create;
Model.find_or_create_by = find_or_create_by;
Model.reflect_on_association = reflect_on_association;
Model.reflect_on_associations = reflect_on_associations;
Model.urlRoot = urlRoot;
Model.where = where;

export default Model;