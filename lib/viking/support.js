/**
 * Support is a collection of utility classes and standard library
 * extensions that were found useful for the Viking framework. These
 * additions reside in this package so they can be loaded as needed
 * in Javascript projects outside of Viking.
 * @module Support
 * @ignore
 */

import * as array from './support/array';
import * as boolean from './support/boolean';
import * as date from './support/date';
import * as number from './support/number';
import * as object from './support/object';
import * as string from './support/string';
import * as klass from './support/class';

export {deepAssign, pick, isPlainObject} from './support/object';

const toArray = array.toArray
export {toArray};

const scanPrototypesFor = klass.scanPrototypesFor
export {scanPrototypesFor}

/**
 * Converts a value to a string parameter representation
 * Delegates to the appropriate type-specific converter
 * 
 * @param {*} value - The value to convert to parameter form
 * @returns {string} The string parameter representation of the value
 * @ignore
 */
export function toParam(value) {

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

    // TODO: throw error here
}

/**
 * Converts a value to a query string parameter
 * Delegates to the appropriate type-specific converter based on value's type
 * 
 * @param {*} value - The value to convert to a query parameter
 * @param {string} key - The key for the query parameter
 * @returns {string|undefined} The formatted query string parameter or undefined if value is null/undefined
 * @ignore
 */
export function toQuery(value, key) {

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
    
    // TODO: throw error here
}

/**
 * Iterates over elements of a collection (array, object, DataTransferItemList)
 * and executes the callback for each element
 * 
 * @ignore
 * @param {Array|Object|DataTransferItemList} value - The collection to iterate over
 * @param {Function} callback - Function to execute for each element
 *   For arrays: (item, index) => {}
 *   For objects: (key, value) => {}
 *   For DataTransferItemList: (item, index) => {}
 */
export function each(value, callback) {
    if (value === null || value === undefined) {
        return;
    }
    
    if (Array.isArray(value)) {
        value.forEach(callback);
    } else if (value instanceof window.DataTransferItemList) {
        for (var i = 0; i < value.length; i++) {
            callback(value[i], i);
        }
    } else {
        Object.keys(value).forEach((k) => {
            callback(k, value[k]);
        });
    }
}

/**
 * Checks if a value is a function
 * 
 * @ignore
 * @param {*} object - The value to check
 * @returns {boolean} True if value is a function, false otherwise
 */
export function isFunction(object) {
    return !!(object && object.constructor && object.call && object.apply);
}

/**
 * Retrieves the value of a property from an object. If the value is a function,
 * it is invoked with the given arguments and its return value becomes the result.
 * If an array is passed, it returns the result from the first object in the array
 * that has the specified property.
 * 
 * @ignore
 * @param {Object|Array} obj - The object or array of objects to retrieve the property from
 * @param {string} [key] - The name of the property to retrieve
 * @param {...*} args - Arguments to pass to the function if the property is a function
 * @returns {*} The property value, or the result of calling the function
 */
export function result(obj, key, ...args) {
    if (Array.isArray(obj)) {
        obj = obj.find(x => x[key] !== undefined)
    }
    
    let value = obj;
    if (key) {
        value = obj[key]
    }
    
    if (isFunction(value)) {
        return value.call(obj, ...args);
    } else {
        return value;
    }
}

let idCounter = 0;

/**
 * Generates a unique ID prefixed with the provided string
 * 
 * @ignore
 * @param {string} prefix - The prefix to use for the ID
 * @returns {string} A unique ID with the specified prefix
 */
export function uniqueId(prefix) {
    let id = ++idCounter;
    return prefix + id;
}

/**
 * Executes the callback when the DOM is fully loaded
 * If DOM is already loaded, executes the callback immediately
 * 
 * @ignore
 * @param {Function} callback - Function to execute when DOM is ready
 */
export function domReady(callback) {
    if (document.readyState !== 'loading') {
      callback();
    } else {
      document.addEventListener('DOMContentLoaded', callback);
    }
}

/**
 * Creates a deep clone of a value
 * Handles null, undefined, arrays, plain objects, and primitive values
 * 
 * @ignore
 * @param {*} value - The value to clone
 * @returns {*} A deep clone of the value
 */
export function clone(value) {
    if (value === undefined || value === null) return value;
    if (Array.isArray(value)) {
        let dup = [];
        
        value.forEach((v) => {
            dup.push(clone(v))
        });
        
        return dup;
    } else if (typeof value == "object" && value.__proto__ == Object.prototype) {
        let dup = {};
        Object.keys(value).forEach((k) => {
            dup[k] = clone(value[k]);
        });

        return dup;
    } else {
        return value;
    }
}

/**
 * Performs a deep comparison between two values to determine if they are equivalent
 * 
 * @ignore
 * @param {*} a - First value to compare
 * @param {*} b - Second value to compare
 * @returns {boolean} True if the values are equivalent, false otherwise
 */
export function isEqual(a, b) {
    if (a === b) {
      return true;
    }
    
    if (Array.isArray(a) && Array.isArray(b)) {
        return arrayIsEqual(a, b);
    }
    
    if (a === null || b === null || a === undefined || b === undefined) {
        return false;
    }
    
    if (typeof a !== 'object' || typeof b !== 'object') {
        return false;
    }
    
    let akeys = Object.keys(a);
    let bkeys = Object.keys(b);
    
    for (let i = 0; i < bkeys.length; i++) { 
        if (!akeys.includes(bkeys[i])) {
            return false;
        }
    }
    
    for (let i = 0; i < akeys.length; i++) { 
        if (!bkeys.includes(akeys[i])) {
            return false;
        }
    }
    
    for (let i = 0; i < akeys.length; i++) { 
        if ( !isEqual(a[akeys[i]], b[akeys[i]]) ) {
            return false;
        }
    }
    
    if ((a.constructor !== Object && a.valueOf) && (b.constructor !== Object && b.valueOf)) {
        return a.valueOf() === b.valueOf()
    }
    
    return true;
}

/**
 * Helper function to compare arrays for equality
 * 
 * @ignore
 * @param {Array} a - First array to compare
 * @param {Array} b - Second array to compare
 * @returns {boolean} True if arrays are equivalent, false otherwise
 * @private
 */
function arrayIsEqual(a, b) {
    if (a.length != b.length) {
        return false;
    }
    
    for (let i = 0; i < a.length; i++) { 
        if (!isEqual(a[i], b[i])) {
            return false;
        }
    }
    
    return true;
}