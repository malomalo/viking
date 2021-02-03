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
//
// export function toParam(object: any, namespace?: string): string
export function toParam(object, namespace) {
    return Object.keys(object).map((key) => {
        const value = object[key];
        const namespaceWithKey = (namespace ? (namespace + '[' + key + ']') : key);

        if (value === null || value === undefined) {
            return encodeURIComponent(namespaceWithKey);
        } else {
            return support.toQuery(value, namespaceWithKey);
        }

    }).join('&');
}

export const toQuery = toParam;

export function pick(object, ...keys) {
  var res = {};

  keys.forEach(function(key) {
    if (key in object) {
      res[key] = object[key];
    }
  });

  return res;
}

export function deepAssign (target, ...objects) {
    objects.forEach(object => {
        if(typeof object == "object") {
            Object.keys(object).forEach(key => {
                const value = object[key]
                if(typeof target[key] == 'object' && typeof value == 'object') {
                    target[key] = deepAssign(target[key], value)
                } else {
                    target[key] = value
                }
            })
        }
    })
    return target
}