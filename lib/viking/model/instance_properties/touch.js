// Saves the record with the updated_at and any attributes passed in to the
// current time.
//
// The JSON response is expected to return an JSON object with the attribute
// name and the new time. Any other attributes returned in the JSON will be
// updated on the Model as well
//
// TODO:
// Note that `#touch` must be used on a persisted object, or else an
// Viking.Model.RecordError will be thrown.
Viking.Model.prototype.touch = function(columns, options) {
    let now = new Date();
    
    let attrs = {
        updated_at: now
    }

    options = _.extend({patch: true}, options);
    
    if (_.isArray(columns)) {
        _.each(columns, function (column) {
            attrs[column] = now;
        });
    } else if (columns) {
        attrs[columns] = now;
    }
    
    return this.save(attrs, options);
};