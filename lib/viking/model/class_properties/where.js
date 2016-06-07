// Returns a unfetched collection with the predicate set to the query
Viking.Model.where = function(options) {
    // TODO: Move to modelName as well?
    let Collection = (this.modelName.name + 'Collection').constantize();
    
    return new Collection(undefined, {predicate: options});
};