const Reflection = function () { };

_.extend(Viking.Model.Reflection.prototype, {

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

export default Reflection;


