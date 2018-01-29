import * as _ from 'underscore';
import * as Backbone from 'backbone';

import { Collection } from './collection';
import { Cursor } from './cursor';

export const PaginatedCollection = Collection.extend({
    constructor: function (models, options) {
        Collection.apply(this, arguments);
        this.cursor = ((options && options.cursor) || new Cursor());
        this.listenTo(this.cursor, 'change', function () {
            if (this.cursor.requiresRefresh()) {
                this.cursorChanged.apply(this, arguments);
            }
        });
    },

    predicateChanged: function (predicate, options) {
        this.cursor.reset({ silent: true });
        this.cursorChanged();
    },

    cursorChanged: function (cursor, options) {
        this.fetch();
    },

    parse: function (attrs, xhr) {
        this.cursor.set({
            total_count: parseInt(xhr.xhr.getResponseHeader('Total-Count'))
        });

        return attrs;
    },

    sync: function (method, model, options) {
        if (method === 'read') {
            options.data || (options.data = {});
            options.data.limit = model.cursor.limit();
            options.data.offset = model.cursor.offset();
            options.headers || (options.headers = {});
            options.headers['Total-Count'] = 'true';
        }
        return Collection.prototype.sync.call(this, method, model, options);
    }

});