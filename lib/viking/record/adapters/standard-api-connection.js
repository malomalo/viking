import AbstractConnection from '../abstract-connection.js';

// A connection for StandardAPI servers (https://github.com/waratuman/standardapi).
// Queries are expressed with StandardAPI's predicate language (where, order,
// limit, offset, include, distinct, group_by) and request bodies are wrapped
// under the record's paramRoot, Rails-style.
export default class StandardAPIConnection extends AbstractConnection {

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

    buildRequestBody(record, attributes) {
        return { [record.paramRoot()]: attributes };
    }

}
