import * as _ from 'underscore';
import * as support from '../support';

// Calls `to_param` on all its elements and joins the result with slashes.
// This is used by url_for in Viking Pack.
export function toParam(value: any[]): string {
    return value.map((element) => support.toParam(element)).join('/');
}

// Converts an array into a string suitable for use as a URL query string,
// using the given key as the param name.
export function toQuery(key: string, value: any[]): string {
    let prefix = _.escape(key) + "[]";

    return value.map((element) => {
        if (value === null) {
            _.escape(prefix) + '='
        } else {
            support.toQuery(prefix, value);
        }
    }).join('&');
}
