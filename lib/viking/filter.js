Viking.Filter = Backbone.Model.extend({
    parameters: function() {
        var params = {};
        _.each(this.attributes, function(value, key) {
            if(value && value !== '' && value.length > 0) {
                params[key] = value;
            }
        });
        return params;
    }
});