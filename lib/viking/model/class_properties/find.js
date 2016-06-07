// Find model by id. Accepts success and error callbacks in the options
// hash, which are both passed (model, response, options) as arguments.
//
// Find returns the model, however it most likely won't have fetched the
// data	from the server if you immediately try to use attributes of the
// model.
Viking.Model.find = function(id, options) {
	let model = new this({id: id});
	model.fetch(options);
	return model;
};