// Returns a unfetched collection with the predicate set to the query
Viking.Model.where = function(options) {
    var Collection = (this.modelName.capitalize() + 'Collection').constantize();
    
    return new Collection(undefined, {predicate: options});
};