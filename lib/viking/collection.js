Viking.Collection = Backbone.Collection.extend({
    model: Viking.Model,

    constructor: function(models, options) {
        Backbone.Collection.apply(this, arguments);
        
        if(options && options.filter) {
            this.setFilter(options.filter, {silent: true});
        }
    },
    
    url: function() {
        return "/" + this.model.modelName.underscore().pluralize();
    },
    paramRoot: function() {
        return this.model.modelName.underscore().pluralize();
    },
    
    // If a filter is set it's paramaters will be passed as under the
    // filter namespace when querying the server
    setFilter: function(filter, options) {
        if(this._filter) {
            this.stopListening(this._filter);
        }
        
        if(filter) {
            this._filter = filter;
            this.listenTo(filter, 'change', this.filterChanged);
            if(!(options && options.silent)) {
                this.filterChanged();
            }
        } else {
            delete this._filter;
        }
    },
    
    filterChanged: function(filter, options) {
        this.fetch(options);
    },

    // Sets `'@selected'` to `true` on the `model`. If `clearCurrentlySelected`
    // is truthy all other models will have `@selected` set to `false`.
    // Also triggers the `selected` event on the collection. If the model is
    // already selected the `selected` event is not triggered
    select: function(model, clearCurrentlySelected) {
        if(!clearCurrentlySelected) {
            this.clearSelected(model);
        }
        if(!model.get('@selected')) {
            model.set('@selected', true);
            this.trigger('selected', this.selected());
        }
    },
    
    // returns all the models where `@selected` == true
    selected: function() {
        return this.filter(function(m) {
            return m.get('@selected');
        });
    },
    
    // Sets `'@selected'` to `false` on all models
    clearSelected: function(exceptModel) {
        if(exceptModel instanceof Viking.Model) {
            exceptModel = exceptModel.cid;
        }
        this.each(function(m) {
            if(m.cid !== exceptModel) {
                m.set('@selected', false);
            }
        });
    },
    
    sync: function(method, model, options) {
        if(method === 'read' && this._filter) {
            options.data || (options.data = {});
            options.data.filters = this._filter.attributes;
        }
        Backbone.sync.call(this, method, model, options);
    }
    
});