// Viking.Support
// -------------
//
// Viking.Support is a collection of utility classes and standard library
// extensions that were found useful for the Viking framework. These
// additions reside in this package so they can be loaded as needed
// in Javascript projects outside of Viking.

import * as array from './support/array';
import * as boolean from './support/boolean';
import * as date from './support/date';
import * as number from './support/number';
import * as object from './support/object';
import * as string from './support/string';

export function toParam(value: any) {

    if (Array.isArray(value)) {
        return array.toParam(value);
    }

    if (typeof value === 'boolean') {
        return boolean.toParam(value);
    }

    if (value instanceof Date) {
        return date.toParam(value);
    }

    if (typeof value === 'number') {
        return number.toParam(value);
    }

    if (typeof value === 'string') {
        return string.toParam(value);
    }

    if (typeof value === 'object') {
        return object.toParam(value);
    }

}

export function toQuery(value: any, key: string) {

    if (value === null || value === undefined) {
        return;
    }

    if (Array.isArray(value)) {
        return array.toQuery(value, key);
    }

    if (typeof value === 'boolean') {
        return boolean.toQuery(value, key);
    }

    if (value instanceof Date) {
        return date.toQuery(value, key);
    }

    if (typeof value === 'number') {
        return number.toQuery(value, key);
    }

    if (typeof value === 'string') {
        return string.toQuery(value, key);
    }

    if (typeof value === 'object') {
        return object.toQuery(value, key);
    }
}
