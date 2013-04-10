Backbone.Model.getRelationshipDetails = function(type, key, options) {
    // Handle both `type, key, options` and `type, [key, options]` style arguments
    if (_.isArray(key)) {
      options = key[1];
      key = key[0];
    }

    var relation = {
        key: key
    };

    if(options) {
        if(type == 'hasMany' && options.collection) {
            relation.type = window[options.collection];
        } else if (type == 'hasMany' && options.model) {
            relation.type = window[options.model + 'Collection'];
        } else {
            relation.type = window[options.model];
        }
    } else {
        if(type == 'belongsTo') {
            relation.type = window[relation.key.camelize()];
        } else if (type == 'hasMany') {
            relation.type = window[relation.key.camelize(true).replace(/s$/,'') + 'Collection'];
        }
    }
    
    return relation;
}

