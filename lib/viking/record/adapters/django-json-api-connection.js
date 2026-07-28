import JSONAPIConnection from './json-api-connection.js';
import { VikingError } from '../../errors.js';

// A JSONAPIConnection tuned to Django REST framework JSON:API
// (https://django-rest-framework-json-api.readthedocs.io). The pagination
// params inherited from JSONAPIConnection (page[limit]/page[offset]) match
// DJA's JsonApiLimitOffsetPagination.
export default class DjangoJSONAPIConnection extends JSONAPIConnection {

    defaultHeaders() {
        const headers = super.defaultHeaders();

        const csrfToken = this.csrfToken();
        if (csrfToken) {
            headers['X-CSRFToken'] = csrfToken;
        }

        return headers;
    }

    // Django's CSRF protection stores the token in a cookie; memoized.
    csrfToken() {
        if (this._csrfToken === undefined) {
            this._csrfToken = document.cookie.match(/(?:^|;\s*)csrftoken=([^;]*)/)?.[1] ?? null;
        }
        return this._csrfToken;
    }

    // Django routers expect a trailing slash on collection paths.
    path(target, association, record) {
        const path = super.path(target, association, record);
        return typeof target === 'function' ? path.replace(/\/?$/, '/') : path;
    }

    // DJA's DjangoFilterBackend expects Django ORM lookups and relationship
    // paths as dot-notation keys — filter[age.gt]=30, not filter[age][gt]=30 —
    // so predicate objects are flattened. Clauses are merged into one filter
    // object since django-filter can only AND filters together.
    setWhere(params, relation) {
        if (relation._where.length === 0) return;

        const filter = {};
        relation._where.forEach((clause) => {
            if (typeof clause === 'string') {
                if (clause !== 'AND') {
                    throw new VikingError(`"${clause}" where clauses cannot be expressed as Django REST framework JSON:API filters`);
                }
                return;
            }
            this.flattenFilterClause(clause, [], filter);
        });
        params.filter = filter;
    }

    // {age: {gt: 30}}                     -> {'age.gt': 30}
    // {author: {name: {icontains: 'b'}}}  -> {'author.name.icontains': 'b'}
    // {id: [1, 2]} and {id: {in: [1, 2]}} -> {'id.in': '1,2'}
    // {deleted_at: null}                  -> {'deleted_at.isnull': true}
    flattenFilterClause(clause, path, filter) {
        for (const [key, value] of Object.entries(clause)) {
            const keyPath = path.concat(key);
            if (Array.isArray(value)) {
                // Lookups that already take a list just need comma-joining.
                if (key !== 'in' && key !== 'range') keyPath.push('in');
                filter[keyPath.join('.')] = value.join(',');
            } else if (value === null) {
                filter[keyPath.concat('isnull').join('.')] = true;
            } else if (typeof value === 'object' && !(value instanceof Date)) {
                this.flattenFilterClause(value, keyPath, filter);
            } else {
                filter[keyPath.join('.')] = value;
            }
        }
    }

}
