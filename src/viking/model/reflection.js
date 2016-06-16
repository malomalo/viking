import Name from './name';

export const Reflection = function () { };

_.extend(Reflection.prototype, {

    klass: function() {
        if (this.macro === 'hasMany') {
            return this.collection();
        }
        
        return this.model();
    },
    
    model: function() {
        return this.modelName.model();
    },
    
    collection: function() {
        return this.collectionName.constantize();
    }

});

Reflection.extend = Backbone.Model.extend;

export const BelongsTo = Reflection.extend({
    
    constructor: function (name, options) {
        this.name = name;
        this.macro = 'belongsTo';
        this.options = _.extend({}, options);
    
        if (!this.options.polymorphic) {
            if (this.options.modelName) {
                this.modelName = new Name(this.options.modelName);
            } else {
                this.modelName = new Name(name);
            }
        }
    }

});

Reflection.BelongsTo = BelongsTo;

export const HasMany = Reflection.extend({
    
    constructor: function (name, options) {
        this.name = name;
        this.macro = 'hasMany';
        this.options = _.extend({}, options);

        if (this.options.modelName) {
            this.modelName = new Name(this.options.modelName);
        } else {
            this.modelName = new Name(this.name.singularize());
        }

        if (this.options.collectionName) {
            this.collectionName = this.options.collectionName;
        } else {
            this.collectionName = this.modelName.collectionName;
        }
    }

});

Reflection.HasMany  = HasMany;

export const HasOne = Reflection.extend({
    
    constructor: function (name, options) {
        this.name = name;
        this.macro = 'hasOne';
        this.options = _.extend({}, options);

        if (!this.options.polymorphic) {
            if (this.options.modelName) {
                this.modelName = new Name(this.options.modelName);
            } else {
                this.modelName = new Name(name);
            }
        }
    }

});

Reflection.HasOne = HasOne;

export const HasAndBelongsToMany = Reflection.extend({

    constructor: function (name, options) {
        this.name = name;
        this.macro = 'hasAndBelongsToMany';
        this.options = _.extend({}, options);
    
        if (this.options.modelName) {
            this.modelName = new Name(this.options.modelName);
        } else {
            this.modelName = new Name(this.name.singularize());
        }

        if (this.options.collectionName) {
            this.collectionName = this.options.CollectionName;
        } else {
            this.collectionName = this.modelName.collectionName;
        }

    }
    
});

Reflection.HasAndBelongsToMany = HasAndBelongsToMany;

export default Reflection;
