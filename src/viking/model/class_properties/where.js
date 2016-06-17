import { global } from '../../global';

// Returns a unfetched collection with the predicate set to the query
export const where = function(options) {
    // TODO: Move to modelName as well?
    let Collection = (this.modelName.name + 'Collection').constantize(global);
    
    return new Collection(undefined, {predicate: options});
};
