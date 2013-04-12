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
    
    filterChanged: function(filter, options) {
        this.cursor.reset({silent: true});
        this.cursorChanged(undefined, options);
    },
    
    cursorChanged: function(cursor, options) {
        this.fetch(options);
    },
    
    parse: function(response, xhr) {
        this.cursor.set({
            page: parseInt(response.page, 10),
            per_page: parseInt(response.per_page, 10),
            offset: parseInt(response.offset, 10),
            total: parseInt(response.total, 10),
            total_pages: parseInt(response.total_pages, 10),
            count: parseInt(response.count, 10)
        });
        return response[this.paramRoot()];
    },
    
    sync: function(method, model, options) {
        if(method === 'read') {
            options.data || (options.data = {});
            options.data.page = model.cursor.get('page');
            options.data.per_page = model.cursor.get('per_page');
            options.data.offset = model.cursor.get('offset');
        }
        Viking.Collection.prototype.sync.call(this, method, model, options);
    }
    
});