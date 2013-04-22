// TODO remove?
Viking.Controller = Backbone.Model.extend({}, {
    
    instance: function(onInstantiated, onInstantiation) {
        if(this._instance) {
            if(onInstantiated) { onInstantiated(this._instance); }
        } else {
            this._instance = new this();
            if(onInstantiation) { onInstantiation(this._instance); }
        }

        return this._instance;
    }
});