Viking.PaginatedCollection = Viking.Collection.extend({
    constructor: function(models, options) {
        Viking.Collection.apply(this, arguments);
        this.cursor = ((options && options.cursor) || new Viking.Cursor());
        this.listenTo(this.cursor, 'change', function() {
            if(this.cursor.requiresRefresh()) {
                this.cursorChanged.apply(this, arguments);
            }
        });
    },
    
    predicateChanged: function(predicate, options) {
        this.cursor.reset({silent: true});
        this.cursorChanged();
    },
    
    cursorChanged: function(cursor, options) {
        this.fetch(options);
    },
    
    parse: function(attrs, xhr) {
        this.cursor.set({
            total_count: parseInt(xhr.xhr.getResponseHeader('Total-Count'))
        });
        
        return attrs;
    },
    
    sync: function(method, model, options) {
        if(method === 'read') {
            options.data || (options.data = {});
            options.data.limit = model.cursor.limit();
            options.data.offset = model.cursor.offset();
            options.headers || (options.headers = {});
            options.headers['Total-Count'] = 'true';
        }
        return Viking.Collection.prototype.sync.call(this, method, model, options);
    }
    
});