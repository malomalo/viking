// Create a model with +attributes+. Options are the 
// same as Viking.Model#save
Viking.Model.create = function(attributes, options) {
    var model = new this(attributes);
    model.save(options);
    return model;
};