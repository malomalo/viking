// Find or create model by attributes. Accepts success callbacks in the
// options hash, which is passed (model) as arguments.
//
// findOrCreateBy returns the model, however it most likely won't have fetched
// the data	from the server if you immediately try to use attributes of the
// model.
Viking.Model.findOrCreateBy = function(attributes, options) {
    let klass = this;
    klass.where(attributes).fetch({
        success: function (modelCollection) {
            let model = modelCollection.models[0];
            if (model) {
                if (options && options.success) options.success(model);
            } else {
                klass.create(attributes, options);
            }
        }
    });
}