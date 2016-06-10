HasManyReflection = Viking.Model.Reflection.extend({
    
    constructor: function (name, options) {
        this.name = name;
        this.macro = 'hasMany';
        this.options = _.extend({}, options);

        if (this.options.modelName) {
            this.modelName = new Viking.Model.Name(this.options.modelName);
        } else {
            this.modelName = new Viking.Model.Name(this.name.singularize());
        }

        if (this.options.collectionName) {
            this.collectionName = this.options.collectionName;
        } else {
            this.collectionName = this.modelName.collectionName;
        }
    }
    
});

export default HasManyReflection;