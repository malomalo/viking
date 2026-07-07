import AbstractConnection from '../abstract-connection.js';

// A connection for StandardAPI servers (https://github.com/waratuman/standardapi).
// Queries are expressed with StandardAPI's predicate language (where, order,
// limit, offset, include, distinct, group_by) and request bodies are wrapped
// under the record's paramRoot, Rails-style.
export default class StandardAPIConnection extends AbstractConnection {

    // --- Headers ---

    acceptHeader = 'application/json';

    defaultHeaders() {
        const headers = { ...super.defaultHeaders(), 'Accept': this.acceptHeader, 'Api-Version': '0.5.0' };

        const csrfToken = this.csrfToken();
        if (csrfToken) {
            headers['X-CSRF-Token'] = csrfToken;
        }

        return headers;
    }

    // Rails embeds the CSRF token in a meta tag; memoized.
    csrfToken() {
        if (this._csrfToken === undefined) {
            this._csrfToken = document.head.querySelector('meta[name="csrf-token"]')?.getAttribute('content') ?? null;
        }
        return this._csrfToken;
    }

    // --- Query Parameters ---

    setWhere(params, relation) {
        if (relation._where.length > 0) {
            params.where = relation._where.length === 1 ? relation._where[0] : relation._where;
        }
    }

    setOrder(params, relation) {
        let order = relation._order.length === 0 ? [relation.defaultOrder()] : relation._order;
        params.order = order.length === 1 ? order[0] : order;
    }

    setLimit(params, relation) {
        if (relation._limit) { params.limit = relation._limit; }
    }

    setOffset(params, relation) {
        if (relation._offset) { params.offset = relation._offset; }
    }

    setInclude(params, relation) {
        if (relation._include.length > 0) { params.include = relation._include; }
    }

    setDistinct(params, relation) {
        if (relation._distinct) {
            if (typeof relation._distinct === "boolean") {
                params.distinct = relation._distinct;
            } else {
                params.distinct_on = relation._distinct;
            }
        }
    }

    setGroupBy(params, relation) {
        if (relation._groupValues.length == 1) {
            params.group_by = relation._groupValues[0];
        } else if (relation._groupValues.length > 1) {
            params.group_by = relation._groupValues;
        }
    }

    // --- Request Body ---

    buildRequestBody(record, attributes = null) {
        return { [record.paramRoot()]: attributes || this.attributesForSave(record) };
    }

    // Composes Rails-style nested attributes (accepts_nested_attributes_for):
    // the record's changed attributes plus any dirty associations, recursively.
    attributesForSave(record) {
        const attributes = super.attributesForSave(record);

        record.associations().forEach((association) => {
            if (!association.needsSaved()) return;

            this.assertSameConnection(record, association);
            attributes[association.reflection.name] = this.associationAttributesForSave(association);
        });

        return attributes;
    }

    // Shapes a dirty association for embedding, following Rails' nested
    // attributes conventions: persisted records carry their primary key, and
    // a hasOne omits its foreign key (the server sets it from the nesting).
    associationAttributesForSave(association) {
        switch (association.reflection.macro) {
            case 'hasMany':
            case 'hasAndBelongsToMany':
                //TODO: Only send ids if targets haven't changed
                return association.target.map((record) => this.nestedAttributesForSave(record));
            case 'hasOne': {
                if (!association.target) {
                    return null;
                }
                const attributes = this.nestedAttributesForSave(association.target);
                delete attributes[association.reflection.foreignKey()];
                return attributes;
            }
            case 'belongsTo':
                return this.nestedAttributesForSave(association.target);
        }
    }

    nestedAttributesForSave(record) {
        const attributes = this.attributesForSave(record);
        if (record.isPersisted()) {
            attributes[record.constructor.primaryKey] = record.primaryKey();
        }
        return attributes;
    }

}
