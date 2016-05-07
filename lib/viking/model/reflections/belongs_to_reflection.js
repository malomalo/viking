Viking.Model.BelongsToReflection = Viking.Model.Reflection.extend({
    
    constructor: function (name, options) {
        this.name = name;
        this.macro = 'belongsTo';
        this.options = _.extend({}, options);
    
        if (!this.options.polymorphic) {
            if (typeof(this.options.modelName) === 'string') {
                this.modelName = new Viking.Model.Name(this.options.modelName);
            } else {
                this.modelName = new Viking.Model.Name(name);
            }
        }
    }
    
});