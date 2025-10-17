/**
 * @module Support.Boolean
 * @memberof Support
 * @ignore
 */

import {toParam as stringToParam} from './string.js';

/**
 * Converts a boolean to its string representation.
 * Simply an alias of toString.
 * 
 * @ignore
 * @param {boolean} value - The boolean to convert
 * @returns {string} The string representation of the boolean
 */
export function toParam(value) {
    return value.toString();
}

/**
 * Converts a boolean to a URL query parameter
 * 
 * @ignore
 * @param {boolean} value - The boolean value
 * @param {string} key - The key for the query parameter
 * @returns {string} URL query parameter in the form key=value
 */
export function toQuery(value, key) {
    return encodeURIComponent(stringToParam(key)) + '=' + encodeURIComponent(toParam(value));
}
