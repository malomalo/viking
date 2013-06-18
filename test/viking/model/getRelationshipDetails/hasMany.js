(function () {
    module("Viking.Model#getRelationshipDetails - hasMany");

    // getRelationshipDetails ----------------------------------------------------
    test("#getRelationshipDetails for hasMany 'models'", function() {
        ModelCollection = Backbone.Collection.extend();
    
        deepEqual(
            Viking.Model.getRelationshipDetails('hasMany', 'models'),
            {key: 'models', type: ModelCollection}
        );
    
        delete ModelCollection;
    });

    test("#getRelationshipDetails for hasMany ['carriers', {model: 'Ship'}]", function() {
        Ship = Backbone.Model.extend();
        ShipCollection = Backbone.Collection.extend({model: Ship});
    
        deepEqual(
            Viking.Model.getRelationshipDetails('hasMany', 'carriers', {model: 'Ship'}),
            {key: 'carriers', type: ShipCollection}
        );
    
        delete Ship;
        delete ShipCollection;
    });

    test("#getRelationshipDetails for hasMany ['carriers', {collection: 'ShipCollection'}]", function() {
        Ship = Backbone.Model.extend();
        ShipCollection = Backbone.Collection.extend({model: Ship});
    
        deepEqual(
            Viking.Model.getRelationshipDetails('hasMany', 'carriers', {collection: 'ShipCollection'}),
            {key: 'carriers', type: ShipCollection}
        );
    
        delete Ship;
        delete ShipCollection;
    });

}());