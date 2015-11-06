Viking.Model.BelongsToReflection = Viking.Model.Reflection.extend({
    
    constructor: function (name, options) {
        this.name = name;
        this.macro = 'belongsTo';
        this.options = _.extend({}, options);
    
        if (!this.options.polymorphic) {
            this.modelName = this.options.model || name.camelize();
        }
    }
    
});