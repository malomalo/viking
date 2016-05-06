//= require_self
//= require ./model/reflection
//= require_tree ./model/reflections
//= require_tree ./model/class_properties
//= require_tree ./model/instance_properties
//= require ./model/type
//= require_tree ./model/types



// Viking.Model
// ------------
//
// Viking.Model is an extension of [Backbone.Model](http://backbonejs.org/#Model).
// It adds naming, relationships, data type coercions, selection, and modifies
// sync to work with [Ruby on Rails](http://rubyonrails.org/) out of the box.
Viking.Model = Backbone.Model.extend({

    abstract: true,

    // inheritanceAttribute is the attirbutes used for STI
    inheritanceAttribute: 'type',

    defaults: function () {
        dflts = {};
        
        _.each(this.schema, function(options, key) {
            if(options['default']) {
                dflts[key] = options['default'];
            }
        });

        return dflts;
    },
    
    // Below is the same code from the Backbone.Model function
    // except where there are comments
    constructor: function (attributes, options) {
        var attrs = attributes || {};
        options || (options = {});
        this.cid = _.uniqueId('c');
        this.attributes = {};
        
        attrs = _.defaults({}, attrs, _.result(this, 'defaults'));
        
        if (this.inheritanceAttribute) {
            if (attrs[this.inheritanceAttribute] && this.constructor.modelName !== attrs[this.inheritanceAttribute]) {
                // OPTIMIZE:  Mutating the [[Prototype]] of an object, no matter how
                // this is accomplished, is strongly discouraged, because it is very
                // slow and unavoidably slows down subsequent execution in modern
                // JavaScript implementations
                // Ideas: Move to Model.new(...) method of initializing models
                var type = attrs[this.inheritanceAttribute].camelize().constantize();
                this.constructor = type;
                this.__proto__ = type.prototype;
            }
        }
        
        // Add a helper reference to get the model name from an model instance.
        this.modelName = this.constructor.modelName;
        this.baseModel = this.constructor.baseModel;

        if (this.baseModel && this.inheritanceAttribute) {
            if (this.baseModel === this.constructor && this.baseModel.descendants.length > 0) {
                attrs[this.inheritanceAttribute] = this.modelName;
            } else if (_.contains(this.baseModel.descendants, this.constructor)) {
                attrs[this.inheritanceAttribute] = this.modelName;
            }
        }

        // Set up associations
        this.associations = this.constructor.associations;
        this.reflectOnAssociation = this.constructor.reflectOnAssociation;
        this.reflectOnAssociations = this.constructor.reflectOnAssociations;

        // Initialize any `hasMany` relationships to empty collections
        _.each(this.reflectOnAssociations('hasMany'), function(association) {
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

        var child = Backbone.Model.extend.call(this, protoProps, staticProps);

        if(typeof name === 'string') { child.modelName = name; }

        child.associations = {};
        child.descendants = [];
        child.inheritanceAttribute = (protoProps.inheritanceAttribute === undefined) ? this.prototype.inheritanceAttribute : protoProps.inheritanceAttribute;
        
        if (child.inheritanceAttribute === false || (this.prototype.hasOwnProperty('abstract') && this.prototype.abstract)) {
            child.baseModel = child;
        } else {
            child.baseModel.descendants.push(child);
        }
        
        _.each(['belongsTo', 'hasOne', 'hasMany', 'hasAndBelongsToMany'], function(macro) {
            _.each((protoProps[macro] || []).concat(this[macro] || []), function(name) {
                var options;

                // Handle both `type, key, options` and `type, [key, options]` style arguments
                if (_.isArray(name)) {
                    options = name[1];
                    name = name[0];
                }

                if (!child.associations[name]) {
                    var reflectionClass = {
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
            _.each(this.prototype.schema, function(value, key) {
                if(!child.prototype.schema[key]) {
                    child.prototype.schema[key] = value;
                }
            });
        }

        
        return child;
    }

});
