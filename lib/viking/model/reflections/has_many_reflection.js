Viking.Model.HasManyReflection = Viking.Model.Reflection.extend({
    
    constructor: function (name, options) {
        this.name = name;
        this.macro = 'hasMany';
        this.options = _.extend({}, options);
    
        if (this.options.collection) {
            this.collectionName = options.collection;
        } else if (this.options.model) {
            this.collectionName = (this.options.model + 'Collection');
        } else {
            this.collectionName = (this.name.singularize().camelize() + 'Collection');
        }
    }
    
});