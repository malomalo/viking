// Create a model with +attributes+. Options are the 
// same as Viking.Model#save
export let create = function(attributes, options) {
    let model = new this(attributes);
    model.save(null, options);
    return model;
};

// Find model by id. Accepts success and error callbacks in the options
// hash, which are both passed (model, response, options) as arguments.
//
// Find returns the model, however it most likely won't have fetched the
// data	from the server if you immediately try to use attributes of the
// model.
export let find = function(id, options) {
    let model = new this({id: id});
    model.fetch(options);
    return model;
};

// Find or create model by attributes. Accepts success callbacks in the
// options hash, which is passed (model) as arguments.
//
// findOrCreateBy returns the model, however it most likely won't have fetched
// the data	from the server if you immediately try to use attributes of the
// model.
export let findOrCreateBy = function(attributes, options) {
    let klass = this;
    klass.where(attributes).fetch({
        success: function (modelCollection) {
            let model = modelCollection.models[0];
            if (model) {
                if (options && options.success) options.success(model);
            } else {
                klass.create(attributes, options);
            }
        }
    });
}

export let reflectOnAssociation = function(name) {
    return this.associations[name];
};

export let reflectOnAssociations = function(macro) {
    let associations = _.values(this.associations);
    if (macro) {
        associations = _.select(associations, function(a) {
            return a.macro === macro;
        });
    }

    return associations;
};

// Generates the `urlRoot` based off of the model name.
export let urlRoot = function() {
    if (this.prototype.hasOwnProperty('urlRoot')) {
        return _.result(this.prototype, 'urlRoot')
    } else if (this.baseModel.prototype.hasOwnProperty('urlRoot')) {
        return _.result(this.baseModel.prototype, 'urlRoot')
    } else {
        return "/" + this.baseModel.modelName.plural;
    }
};

// Returns a unfetched collection with the predicate set to the query
export let where = function(options) {
    // TODO: Move to modelName as well?
    let Collection = (this.modelName.name + 'Collection').constantize();
    
    return new Collection(undefined, {predicate: options});
};

export let associations = [];

// Overide the default extend method to support passing in the modelName
// and support STI
//
// The modelName is used for generating urls and relationships.
//
// If a Model is extended further is acts simlar to ActiveRecords STI.
//
// `name` is optional, and must be a string
export let extend = function(name, protoProps, staticProps) {
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
};
