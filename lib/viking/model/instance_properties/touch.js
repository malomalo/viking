// PUTs to `/models/:id/touch` with the intention that the server sets the
// updated_at/on attributes to the current time.
//
// The JSON response is expected to return an JSON object with the attribute
// name and the new time. Any other attributes returned in the JSON will be
// updated on the Model as well
//
// If name is passed as an option it is passed as `name` paramater in the
// request
//
// TODO:
// Note that `#touch` must be used on a persisted object, or else an
// Viking.Model.RecordError will be thrown.
Viking.Model.prototype.touch = function(name, options) {

    // TODO move to extend and extend a new object so not writing to old options
    _.defaults(options || (options = {}), {
        type: 'PUT',
        url: _.result(this, 'url') + '/touch'
    });
    
    if (name) {
        options.contentType = 'application/json';
        options.data = JSON.stringify({name: name});
    } else {
        options.data = '';
    }
    
    return this.save(null, options);
};