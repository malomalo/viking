Viking.Model.Type.registry['json'] = Viking.Model.Type.JSON = {

    load: function(value, key) {
        if (typeof value === 'object') {
			var AnonModel = Viking.Model.extend({
				inheritanceAttribute: false
			});
            var model = new AnonModel(value);
            model.modelName = key;
            model.baseModel = model;
            return model;
        }

        throw new TypeError(typeof value + " can't be coerced into JSON");
    },

    dump: function(value) {
        if (value instanceof Viking.Model) {
            return value.toJSON();
        }

        return value;
    }

};