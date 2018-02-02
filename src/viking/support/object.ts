import * as _ from 'underscore';
import * as support from '../support';

// Returns a string representation of the receiver suitable for use as a URL
// query string:
// 
// {name: 'David', nationality: 'Danish'}.toParam()
// // => "name=David&nationality=Danish"
// An optional namespace can be passed to enclose the param names:
// 
// {name: 'David', nationality: 'Danish'}.toParam('user')
// // => "user[name]=David&user[nationality]=Danish"
//
// The string pairs "key=value" that conform the query string are sorted
// lexicographically in ascending order.
export function toParam(object: object, namespace?: string): string {
    return Object.keys(object).map((key) => {
        const value = object[key];
        const namespaceWithKey = (namespace ? (namespace + '[' + key + ']') : key);

        if (value === null || value === undefined) {
            return encodeURI(namespaceWithKey);
        } else {
            return support.toQuery(value, namespaceWithKey);
        }

    }).join('&');
}

export const toQuery = toParam;