import Connection from '../connection.js';

export default class JSONAPIConnection extends Connection {

    // --- Headers ---

    acceptHeader() { return 'application/vnd.api+json'; }
    contentTypeHeader() { return 'application/vnd.api+json'; }

    // --- Routes ---

    formatRouteKey(klass) {
        return klass.modelName().routeKey.replace(/_/g, '-');
    }

    formatPath(path) {
        return path.replace(/\/?$/, '/');
    }

    // --- Method ---

    method(action) {
        if (action === 'update') return 'patch';
        return super.method(action);
    }

    // --- Query Parameters ---

    setWhere(params, relation) {
        if (relation._where.length > 0) {
            const where = relation._where.length === 1 ? relation._where[0] : relation._where;
            if (typeof where === 'object' && !Array.isArray(where)) {
                params.filter = where;
            } else {
                params.filter = where;
            }
        }
    }

    setOrder(params, relation) {
        let order = relation._order.length === 0 ? [relation.defaultOrder()] : relation._order;
        params.sort = order.map(o => {
            let [key, dir] = Object.entries(o)[0];
            return dir === 'desc' ? `-${key}` : key;
        }).join(',');
    }

    setLimit(params, relation) {
        if (relation._limit) {
            if (!params.page) params.page = {};
            params.page.size = relation._limit;
        }
    }

    setOffset(params, relation) {
        if (relation._offset) {
            if (!params.page) params.page = {};
            params.page.offset = relation._offset;
        }
    }

    setInclude(params, relation) {
        if (relation._include.length > 0) {
            params.include = relation._include.join(',');
        }
    }

    // --- Request Body ---
    // TODO: update to account for {data: {relationships}, includes: []}
    buildRequestBody(record, attributes) {
        const data = {
            type: this.formatRouteKey(record.constructor),
            attributes
        };

        const id = record.primaryKey();
        if (id) data.id = String(id);

        return { data };
    }

    // --- Response Deserialization ---

    deserializeResponseBody(response, request) {
        if (!response || !response.data) return response;

        const included = response.included || [];

        if (Array.isArray(response.data)) {
            return response.data.map(resource => this.flattenResource(resource, included));
        }

        return this.flattenResource(response.data, included);
    }

    flattenResource(resource, included = []) {
        const attrs = { ...resource.attributes };
        if (resource.id !== undefined) {
            attrs.id = resource.id;
        }
        
        if (resource.relationships) {
            for (const [name, rel] of Object.entries(resource.relationships)) {
                if (!rel.data) {
                    attrs[name] = null;
                } else if (Array.isArray(rel.data)) {
                    attrs[name] = rel.data.map(ref => {
                        const inc = included.find(i => i.type === ref.type && i.id === ref.id);
                        return inc ? this.flattenResource(inc, included) : { id: ref.id };
                    });
                } else {
                    const inc = included.find(i => i.type === rel.data.type && i.id === rel.data.id);
                    attrs[name] = inc ? this.flattenResource(inc, included) : { id: rel.data.id };

                }
            }
        }

        return attrs;
    }

    // --- Error Parsing ---

    parseErrors(responseText, contentType) {
        const body = JSON.parse(responseText);
        if (!body.errors) return {};

        const errors = {};
        body.errors.forEach(e => {
            const pointer = e.source?.pointer || '';
            const field = pointer.split('/').pop() || 'base';
            if (!errors[field]) errors[field] = [];
            errors[field].push(e.detail || e.title || 'is invalid');
        });
        return errors;
    }

    // --- Association Paths ---

    buildAssociationPath(owner, associationName, record) {
        const type = this.formatRouteKey(owner.constructor);
        const id = owner.primaryKey();
        return `/${type}/${id}/relationships/${associationName}`;
    }

}
