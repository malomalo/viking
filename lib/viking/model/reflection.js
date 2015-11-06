Viking.Model.Reflection = function () { };
_.extend(Viking.Model.Reflection.prototype, {
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
});
Viking.Model.Reflection.extend = Backbone.Model.extend;