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
export function toParam(object={}, namespace) {
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
        if (Array.isArray(object)) {
            target.length = 0
            object.forEach((o, i) => {
                if (Array.isArray(o)) {
                    target[i] = deepAssign([], o)
                } else if (isPlainObject(o)) {
                    target[i] = deepAssign({}, o)
                } else {
                    target[i] = o
                }
            })
        } else if (isPlainObject(object)) {
            Object.keys(object).forEach(key => {
                const value = object[key]
                if (Array.isArray(value)) {
                    target[key] = deepAssign([], value)
                } else if (isPlainObject(target[key]) && isPlainObject(value)) {
                    target[key] = deepAssign(target[key], value)
                } else if (isPlainObject(value)) {
                    target[key] = deepAssign({}, value)
                } else {
                    target[key] = value
                }
            })
        }
    })
    return target
}

export function isPlainObject (o) {
    if (o == null || typeof o !== 'object') {
        return false;
      }
      const proto = Object.getPrototypeOf(o);
      if (proto == null) {
        return true;
      }
      return proto === Object.prototype;
}