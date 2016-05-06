Viking.Model.BelongsToReflection = Viking.Model.Reflection.extend({
    
    constructor: function (name, options) {
        this.name = name;
        this.macro = 'belongsTo';
        this.options = _.extend({}, options);
    
        if (!this.options.polymorphic) {
            this.modelName = this.options.model || {
                className: name.camelize(),
                singular:  name,
                plural:    name.pluralize(),
                routeKey:   name.split('/').pop().pluralize(),
                paramKey:   name.split('/').pop()
            };
        }
    }
    
});