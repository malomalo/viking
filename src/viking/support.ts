// Viking.Support
// -------------
//
// Viking.Support is a collection of utility classes and standard library
// extensions that were found useful for the Viking framework. These
// additions reside in this package so they can be loaded as needed
// in Javascript projects outside of Viking.

import * as string from './support/string';
import * as array from './support/array';

export function toParam(value: any) {
    if (Array.isArray(value)) {
        return array.toParam(value);
    }

    if (typeof value === 'string') {
        return string.toParam(value);
    }
}

export function toQuery(key: string, value: any) {
    if (Array.isArray(value)) {
        return array.toQuery(key, value);
    }

    if (typeof value === 'string') {
        return string.toQuery(key, value);
    }
}