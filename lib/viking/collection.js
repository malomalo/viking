// Viking.Collection
// -----------------
//
// Viking.Collection is an extension of [Backbone.Collection](http://backbonejs.org/#Collection).
// It adds predicates, selection, and modifies fetch to cancel any current
// request if a new fetch is triggered.
Viking.Collection = Backbone.Collection.extend({
    
    // Set the default model to a generic Viking.Model
    model: Viking.Model,

    constructor: function(models, options) {
        Backbone.Collection.call(this, models, options);
        
        if(options && options.predicate) {
            this.setPredicate(options.predicate, {silent: true});
        }
        if(options && options.order) {
            this.order(options.order, {silent: true});
        }

    },
    
    url: function() {
        return "/" + this.model.modelName.plural;
    },
    paramRoot: function() {
        return this.model.modelName.plural;
    },
    
    // If a predicate is set it's paramaters will be passed under the
    // `where` key when querying the server. #predicateChanged is
    // set as a callback on the `change` event for the predicate
    //
    // #setPredicate accepts either attributes to instaniate a
    // Viking.Predicate or an instanceof a Viking.Predicate
    //
    // To remove a predeicate call `#setPredicate` with a falsey value.
    //
    // Calling #setPredicate and setting it the same object that is currently
    // the predicate will not trigger a #predicateChanged call
    setPredicate: function(predicate, options) {
        if (this.predicate === predicate) { return false; }
        
        if(this.predicate) { this.stopListening(this.predicate); }
        
        if(predicate) {
            if(!(predicate instanceof Viking.Predicate)) {
                predicate = new Viking.Predicate(predicate);
            }
            this.predicate = predicate;
            this.listenTo(predicate, 'change', this.predicateChanged);
            if(!(options && options.silent)) { this.predicateChanged(); }
        } else if (this.predicate) {
            delete this.predicate;
            if(!(options && options.silent)) { this.predicateChanged(); }
        }
    },
    
    // Called when the predicate is changed. Having this being called
    // when the predicate changes instead of just `fetch` allows sub
    // collections to overwrite what happens when it changes. An example
    // of this would be the `Viking.PaginatedCollection`
    predicateChanged: function(predicate, options) {
        this.trigger('change:predicate', this.predicate);
        this.fetch();
    },

    // Sets `'selected'` to `true` on the `model`. By default all other models
    // will be unselected. If `{multiple: true}` is passed as an option the other
    // models will not be unselected. Triggers the `selected` event on the
    // collection. If the model is already selected the `selected` event is
    // not triggered
    select: function(model, options) {
        options || (options = {});
        
        if(!options.multiple && !_.isArray(model)) {
            this.clearSelected(model);
        }
        if(_.isArray(model)){
            _.each(model, function(model){
                model = this.get(model);
                if(!model) return;
                if(!model.selected) {
                    model.selected = true;
                    model.trigger('selected', model, this.selected());
                }
            }, this)
        } else if(!model.selected) {
            model.selected = true;
            model.trigger('selected', model, this.selected());
        }
    },
    
    // returns all the models where `selected` == true
    selected: function() {
        return this.filter(function(m) { return m.selected; });
    },
    
    // Sets `'selected'` to `false` on all models
    clearSelected: function(exceptModel) {
        if(exceptModel instanceof Backbone.Model) {
            exceptModel = exceptModel.cid;
        }
        this.each(function(m) {
            if(m.cid !== exceptModel) {
                m.unselect();
            }
        });
    },
    
    // Override the default Backbone.Collection#fetch to cancel any current
    // fetch request if fetch is called again. For example when the predicate
    // changes 3 times, if the first 2 request don't return before the 3rd is
    // sent they will be canceled and only the last one will finish and update
    // the collection. You won't get the collection being updated 3 times.
    fetch: function(options) {
        options || (options = {});
        
        var complete = options.complete;
        options.complete = _.bind(function() {
            delete this.xhr;
            if(complete) { complete(); }
        }, this);
        
        if (this.xhr) { this.xhr.abort(); }
        this.xhr = Backbone.Collection.prototype.fetch.call(this, options);
    },
    
	// TODO: testme?
    sync: function(method, model, options) {
        if(method === 'read' && this.predicate) {
            options.data || (options.data = {});
            options.data.where = this.predicate.attributes;
        }
        
        if(method === 'read' && this.ordering) {
            options.data || (options.data = {});
            options.data.order = this.ordering;
        }
        
        return Viking.sync.apply(this, arguments);
    },

    // If a order is set it's paramaters will be passed under the
    // `order` key when querying the server. #orderChanged is
    // set as a callback when the ordering is changed.
    //
    // `#order` accepts key(s) or object(s) specifiying the keys and direction of
    // ordering
    //
    // To remove the ordering call `#order` with a falsey value.
    //
    // If the last arguments has the `silent` key it it. It will be considered
    // as options
    //
    // Examples
    // --------
    //
    // order('size')                            => [{'size': 'asc'}]
    // order(['size', 'id'])                      => [{'size': 'asc'}, {'id': 'asc'}]
    // order('listings.size')                   => [{'listings.size': 'asc'}]
    // order(['listings.size', 'properties.id'])  => [{'listings.size': 'asc'}, {'properties.id': 'asc'}]
    // order({size: 'asc'})                     => [{'size': 'asc'}]
    // order([{size: 'desc'}])                    => [{'size': 'desc'}]
    // order({'listings.size': 'desc'})         => [{'listings.size': 'desc'}]
    // order([{size: 'asc'}, {size: 'desc'}])     => [{'size': 'asc'}, {'id': 'desc'}]
    // order({size: 'asc'}, {silent: true})     => [{'size': 'asc'}]
    order: function(order, options) {
        options || (options = {});
        order = (_.isArray(order) ? order : [order]);
        
        order = _.map(order, function(o) {
            var normalizedOrder;
            
            if(typeof o === 'string') {
                normalizedOrder = {};
                normalizedOrder[o] = 'asc';
            } else {
                normalizedOrder = o;
            }
            
            return normalizedOrder;
        });
        
        if (order.length === 1 && !order[0]) {
            this.ordering = undefined;
            if (!options.silent) { this.orderChanged(order); }
            return;
        }
        
        if (this.ordering) {
            var orderingEqual = _.find( _.map(this.ordering, function(el, i) { return _.isEqual(el, order[i]); }), function (el) { return el; } );
            if (!orderingEqual) {
                this.ordering = order;
                if (!options.silent) { this.orderChanged(order); }
            }
            return;
        }
        
        this.ordering = order;
        if (!options.silent) { this.orderChanged(order); }
    },
    
    // Called when the order is changed. Having this being called
    // when the predicate changes instead of just `fetch` allows sub
    // collections to overwrite what happens when it changes, similar to
    // #predicateChanged
    orderChanged: function(order) {
        this.fetch();
    }
    
});