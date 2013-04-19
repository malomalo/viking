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
        this.fetch();
    },
    
    parse: function(attrs, xhr) {
        this.cursor.set({
            page: parseInt(attrs.page, 10),
            per_page: parseInt(attrs.per_page, 10),
            offset: parseInt(attrs.offset, 10),
            total: parseInt(attrs.total, 10),
            total_pages: parseInt(attrs.total_pages, 10),
            count: parseInt(attrs.count, 10)
        });
        return attrs[this.paramRoot()];
    },
    
    sync: function(method, model, options) {
        if(method === 'read') {
            options.data || (options.data = {});
            options.data.page = model.cursor.get('page');
            options.data.per_page = model.cursor.get('per_page');
            options.data.offset = model.cursor.get('offset');
        }
        return Viking.Collection.prototype.sync.call(this, method, model, options);
    }
    
});