import AbstractConnection from '../abstract-connection.js';
import { VikingError } from '../../errors.js';

// A connection speaking the JSON:API specification (https://jsonapi.org).
// Contains only behavior mandated or recommended by the spec; server
// implementation choices belong in subclasses (e.g. DjangoJSONAPIConnection).
export default class JSONAPIConnection extends AbstractConnection {

    // --- Headers ---

    acceptHeader = 'application/vnd.api+json';

    defaultHeaders() {
        return { ...super.defaultHeaders(), 'Accept': this.acceptHeader };
    }

    // --- Routes ---

    routeKey(klass) {
        return klass.baseClass().modelName().plural.replace(/_/g, '-');
    }

    // --- CRUD Actions ---

    update(...args) {
        return this.patch(...args);
    }

    // --- Query Parameters ---

    setWhere(params, relation) {
        if (relation._where.length > 0) {
            params.filter = relation._where.length === 1 ? relation._where[0] : relation._where;
        }
    }

    setOrder(params, relation) {
        let order = relation._order.length === 0 ? [relation.defaultOrder()] : relation._order;
        params.sort = order.map(o => {
            let [key, dir] = Object.entries(o)[0];
            return dir === 'desc' ? `-${key}` : key;
        }).join(',');
    }

    // The spec reserves the `page` query parameter family but leaves the
    // pagination strategy to the server; this uses the offset-based strategy
    // (page[limit]/page[offset]) since it maps directly to relation semantics.
    setLimit(params, relation) {
        if (relation._limit) {
            if (!params.page) params.page = {};
            params.page.limit = relation._limit;
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

    serializeRequestBody(body, request) {
        return { body: JSON.stringify(body), contentType: 'application/vnd.api+json' };
    }

    buildRequestBody(record, attributes = null) {
        const data = {
            type: this.routeKey(record.constructor),
            attributes: attributes || this.attributesForSave(record)
        };

        const id = record.primaryKey();
        if (id) data.id = String(id);

        // Dirty associations are sent as resource identifiers under
        // relationships; JSON:API has no way to create or modify the
        // associated resources themselves in the same request. Skipped when
        // explicit attributes were passed (e.g. updateAttributes).
        if (!attributes) {
            const relationships = this.buildRelationships(record, data.attributes);
            if (Object.keys(relationships).length > 0) {
                data.relationships = relationships;
            }
        }

        return { data };
    }

    buildRelationships(record, attributes) {
        const relationships = {};

        record.associations().forEach((association) => {
            const reflection = association.reflection;
            const name = reflection.name;

            // A belongsTo assignment surfaces as a foreign key change;
            // JSON:API expresses it as a relationship, not an attribute.
            if (reflection.macro === 'belongsTo') {
                const foreignKey = reflection.foreignKey();
                const assigned = foreignKey in attributes;

                if (association.needsSaved()) {
                    this.assertSameConnection(record, association);
                    relationships[name] = { data: association.target ? this.resourceIdentifier(association.target) : null };
                } else if (assigned) {
                    const type = association.target ? this.routeKey(association.target.constructor)
                        : reflection.model ? this.routeKey(reflection.model)
                        : null;
                    // A polymorphic foreign key without a loaded target has no
                    // determinable type; leave it as an attribute.
                    if (!type) return;

                    this.assertSameConnection(record, association);
                    const value = attributes[foreignKey];
                    relationships[name] = { data: value == null ? null : { type, id: String(value) } };
                } else {
                    return;
                }

                if (assigned) delete attributes[foreignKey];
                return;
            }

            if (!association.needsSaved()) return;

            this.assertSameConnection(record, association);
            if (Array.isArray(association.target)) {
                relationships[name] = { data: association.target.map(r => this.resourceIdentifier(r)) };
            } else {
                relationships[name] = { data: association.target ? this.resourceIdentifier(association.target) : null };
            }
        });

        return relationships;
    }

    resourceIdentifier(record) {
        const id = record.primaryKey();
        if (!id) {
            throw new VikingError(`JSON:API cannot create a nested ${record.constructor.name} in the same request; save it first`);
        }
        return { type: this.routeKey(record.constructor), id: String(id) };
    }

    // --- Response Deserialization ---

    deserializeResponseBody(request) {
        const response = JSON.parse(request.response);
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

    path(target, association, record) {
        if (typeof target !== 'function' && association) {
            const type = this.routeKey(target.constructor);
            return `/${type}/${target.primaryKey()}/relationships/${association}`;
        }

        return super.path(target, association, record);
    }

}
