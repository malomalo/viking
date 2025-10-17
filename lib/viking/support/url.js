import * as support from '../support.js';

/**
 * Helper for parsing search parameters that supports Arrays.
 *
 * Values will always be string; there is no type conversion. Also each array
 * entry will be considered it's own object as in the first example below even 
 * though it may have been generated from a single object:
 *
 * @ignore
 * @param {string} paramString
 * @returns {Object}
 *
 * @example
 * // returns { pets: [ {category: "dogs"}, {name: "Purplish"} ] }
 * // NOT { pets: [ {category: "dogs", name: "Purplish"} ] }
 * parseSearchParams("pets[][category]=dogs&pets[][name]=Purplish") 
 *
 * @example
 * parseSearchParams("x=2") // returns {x: "2"}
 *
 * @example
 * // returns { pets: [ ['dogs'], ['Purplish'] ] }
 * parseSearchParams("pets[][]=dogs&pets[][]=Purplish") 
 */
export function parseSearchParams(paramString) {
    const params = {};

    (new URLSearchParams(paramString)).forEach((value, key) => {
        let bury = params;
        const keys = key.split(/(?:\]\[|\[)/g);

        if (keys[0].at(-1) === '[') { 
            keys[0] = keys[0].slice(0, -1)
        }
        if (keys[keys.length-1].at(-1) === ']') { 
            keys[keys.length-1] = keys[keys.length-1].slice(0, -1)
        }

        while (keys.length > 1) {
            key = keys.shift();
            if (keys[0].length == 0) {
                if (bury[key]) {
                    bury = bury[key];
                } else {
                    bury[key] = [];
                    bury = bury[key];
                }
                keys.shift();
            } else {
                if (bury[key]) {
                    bury = bury[key];
                } else {
                    bury[key] = {};
                    bury = bury[key];
                }
            }
        }
        key = keys.shift();
        if (key === undefined) {
            bury.push(value);
        } else if (key.length === 0) {
            bury.push([value]);
        } else {
            if (Array.isArray(bury)) {
                bury.push({[key]: value});
            } else {
                bury[key] = value;
            }
        }
    });

    return params;
}