//= require_self
//= require_tree ./model/class_properties
//= require_tree ./model/instance_properties


// Viking.Model
// ------------
//
// Viking.Model is an extension of [Backbone.Model](http://backbonejs.org/#Model).
// It adds naming, relationships, data type coerions, selection, and modifies
// sync to work with [Ruby on Rails](http://rubyonrails.org/) out of the box.
Viking.Model = Backbone.Model.extend({

    // Below is the same code from the Backbone.Model function
    // except where there are comments
    constructor: function (attributes, options) {
        var attrs = attributes || {};
        options || (options = {});
        this.cid = _.uniqueId('c');
        this.attributes = {};

        // Add a helper reference to get the model name from an model instance.
        this.modelName = this.constructor.modelName;

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
        attrs = _.defaults({}, attrs, _.result(this, 'defaults'));
        this.set(attrs, options);
        this.changed = {};
        this.initialize.call(this, attributes, options);
    }
    
}, {

    associations: [],

    // TODO: test support not passing in name and just protoProps & staticProps
    // Overide the default extend method to support passing in the model name
    // to be used for url generation and replationships.
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
        _.each(['hasMany', 'belongsTo'], function(macro) {
            _.each(protoProps[macro], function(name) {
                var options;

                // Handle both `type, key, options` and `type, [key, options]` style arguments
                if (_.isArray(name)) {
                    options = name[1];
                    name = name[0];
                }

                child.associations[name] = new Viking.AssociationReflection(macro, name, options);
            });
        });

        return child;
    }

});
