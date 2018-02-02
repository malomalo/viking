import * as support from '../support';

// Calls `to_param` on all its elements and joins the result with slashes.
// This is used by url_for in Viking Pack.
export function toParam(value: any[]): string {
    return value.map((element) => support.toParam(element)).join('/');
}

// Converts an array into a string suitable for use as a URL query string,
// using the given key as the param name.
export function toQuery(value: any[], key: string): string {
    const prefix = encodeURI(key) + '[]';

    return value.map((element) => {
        if (element === null || element === undefined) {
            return encodeURI(prefix) + '=';
        } else {
            return support.toQuery(element, prefix);
        }
    }).join('&');
}
