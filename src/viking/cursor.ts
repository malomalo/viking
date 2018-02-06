import * as Backbone from 'backbone';
import * as _ from 'underscore';

export const Cursor = Backbone.Model.extend({

    defaults: {
        page: 1,
        per_page: 25
    },

    reset(options) {
        this.set({
            page: 1
        }, { silent: true });

        if (!(options && options.silent) && this.requiresRefresh()) {
            this.trigger('reset', this, options);
        }
    },

    incrementPage(options) {
        this.set('page', this.get('page') + 1, options);
    },

    decrementPage(options) {
        this.set('page', this.get('page') - 1, options);
    },

    goToPage(pageNumber, options) {
        this.set('page', pageNumber, options);
    },

    limit() {
        return this.get('per_page');
    },

    offset() {
        return this.get('per_page') * (this.get('page') - 1);
    },

    totalPages() {
        return Math.ceil(this.get('total_count') / this.limit());
    },

    requiresRefresh() {
        const changedAttributes = this.changedAttributes();
        if (changedAttributes) {
            const triggers = ['page', 'per_page'];
            return (_.intersection(_.keys(changedAttributes), triggers).length > 0);
        }

        return false;
    }

});
