import * as support from '../support';

/**
 * descirption...
 * @module Array
 * @memberof Support
 * @ignore
 */

/**
 * Calls `to_param` on all its elements and joins the result with slashes.
 * This is used by url_for in Viking Pack.
 * 
 * @ignore
 * @param {Array} value - The array to convert to a parameter string
 * @returns {string} A string with array values converted to parameters and joined with slashes
 */
export function toParam(value) {
    return value.map((element) => support.toParam(element)).join('/');
}

/**
 * Converts an array into a string suitable for use as a URL query string,
 * using the given key as the param name.
 * 
 * @ignore
 * @param {Array} value - The array to convert to a query string
 * @param {string} key - The key to use as the parameter name
 * @returns {string} A URL query string representation of the array
 */
export function toQuery(value, key) {
    const prefix = key + '[]';

    return value.map((element) => {
        if (element === null || element === undefined) {
            return encodeURIComponent(prefix) + '=';
        } else {
            return support.toQuery(element, prefix);
        }
    }).join('&');
}

/**
 * Returns the last element of an array
 * 
 * @ignore
 * @param {Array} value - The array to get the last element from
 * @returns {*} The last element of the array
 */
export function last(value) {
    return value[value.length - 1];
}

/**
 * Converts a value to an array
 * If value is already an array, returns it unchanged
 * If value has a toArray method, calls that method
 * Otherwise, wraps the value in an array
 * 
 * @ignore
 * @param {*} value - The value to convert to an array
 * @returns {Array} The value as an array
 */
export function toArray(value) {
    if(Array.isArray(value)) return value;
    if(value?.toArray) return value.toArray();
    return [value]
}