// Create a model with +attributes+. Options are the 
// same as Viking.Model#save
Viking.Model.create = function(attributes, options) {
    let model = new this(attributes);
    model.save(null, options);
    return model;
};
