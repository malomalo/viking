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
        var cursor_keys = ['page', 'per_page', 'offset', 'total', 'total_pages', 'count'];
        var cursor_attrs = _.pick(attrs, cursor_keys);
        _.each(cursor_attrs, function(v, k) {
            cursor_attrs[k] = parseInt(v, 10);
        });

        this.cursor.set(cursor_attrs);
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