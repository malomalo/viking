import * as _ from 'underscore';

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
export function toParam(object: Object, namespace?: string): string {
    return Object.keys(object).map((key) => {
        let value = object[key],
            namespaceWithKey = (namespace ? (namespace + "[" + key + "]") : key);

        if (value === null || value === undefined) {
            return _.escape(namespaceWithKey);
        } else {
            return value.toQuery(namespaceWithKey);
        }

    }).join('&');
}

export const toQuery = toParam;
