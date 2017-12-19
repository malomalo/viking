Viking.Model.Type.registry['json'] = Viking.Model.Type.JSON = {

    load: function(value, key) {
        if (typeof value === 'object') {
            var AnonModel = Viking.Model.extend({
                inheritanceAttribute: false
            });
            var model = new AnonModel(value);
            model.modelName = key;
            model.baseModel = model;
            _.each(model.attributes, function(v, k){
                if(typeof v === 'object'){
                    var sub_model = Viking.Model.Type.JSON.load(v, k)
                    model.listenTo(sub_model, 'change', function(){
                        model.trigger('change', arguments);
                    });
                    model.attributes[k] = sub_model;
                }
            })
            return model;
        }

        throw new TypeError(typeof value + " can't be coerced into JSON");
    },

    dump: function(value) {
        if (value instanceof Viking.Model) {
            var output = value.toJSON();
            _.each(output, function(v, k){
                if (v instanceof Viking.Model){
                    output[k] = Viking.Model.Type.JSON.dump(v)
                }
            })
            return output;
        }

        return value;
    }

};