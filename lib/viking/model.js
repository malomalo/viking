import Name from './model/name';
import Type from './model/type';
import Reflection from './model/reflection';
import HasOneReflection from './model/reflections/has_one_reflection';
import HasManyReflection from './model/reflections/has_many_reflection';
import BelongsToReflection from './model/reflections/belongs_to_reflection';
import HasAndBelongsToManyReflection from './model/reflections/has_and_belongs_to_many_reflection';

import * as classProperties from './model/class_properties';

//= require_tree ./model/instance_properties


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

    defaults: function (): {} {
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

}, classProperties);

Model.Name = Name;
Model.Type = Type;
Model.Reflection = Reflection;
Model.HasOneReflection = HasOneReflection;
Model.HasManyReflection  = HasManyReflection;
Model.BelongsToReflection = BelongsToReflection;
Model.HasAndBelongsToManyReflection = HasAndBelongsToManyReflection;

export default Model;