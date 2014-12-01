Viking.Cursor = Backbone.Model.extend({
    defaults: {
        "page": 1,
        "per_page": 25
    },
    
    reset: function(options) {
        this.set({
            page: 1
        }, {silent: true});
        
        if(!(options && options.silent) && this.requiresRefresh()) {
            this.trigger('reset', this, options);
        }
    },
    
    incrementPage: function(options) {
        this.set('page', this.get('page') + 1, options);
    },
    
    decrementPage: function(options) {
        this.set('page', this.get('page') - 1, options);
    },
    
    goToPage: function(pageNumber, options) {
        this.set('page', pageNumber, options);
    },
    
    limit: function() {
        return this.get('per_page');
    },
    
    offset: function () {
        return this.get('per_page') * (this.get('page') - 1);
    },
    
    totalPages: function () {
        return Math.ceil(this.get('total_count') / this.limit());
    },
    
    requiresRefresh: function() {
        var changedAttributes = this.changedAttributes();
        if(changedAttributes) {
            var triggers = ['page', 'per_page'];
            return (_.intersection(_.keys(changedAttributes), triggers).length > 0);
        }
        
        return false;
    }
    
});
