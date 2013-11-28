// Used internally by Viking to translate relation arguments to key and
// Model
//
// - macro: either 'hasMany', 'belongsTo', or 'hasOne'
// - :name =>  the name of the assoication
// - options (optional):
//     - model: model to use
//     - collection: collection to use
Viking.AssociationReflection = function (macro, name, options) {
    options || (options = {});
    
    this.name = name;
    this.macro = macro;
    this.options = options;

    if(macro === 'hasMany') {
        if (options.collection) {
            this.collectionName = options.collection;
        } else if (options.model) {
            this.collectionName = (options.model + 'Collection');
        } else {
            this.collectionName = (this.name.singularize().capitalize() + 'Collection');
        }
    } else if (macro === 'belongsTo' || macro === 'hasOne') {
        if (options.model) {
            this.modelName = options.model;
        } else {
            this.modelName = name.capitalize();
        }
    } else {
        throw new TypeError("Unkown Macro " + macro);
    }
};

Viking.AssociationReflection.prototype = {
    klass: function() {
        if (this.macro === 'hasMany') {
            return this.collection();
        }
        
        return this.model();
    },
    
    model: function() {
        return this.modelName.constantize();
    },
    
    collection: function() {
        return this.collectionName.constantize();
    }
};