import {toParam as stringToParam} from 'viking/support/string';

// Alias of toString.
//
// export function toParam(value: boolean): string
export function toParam(value) {
    return value.toString();
}

// export function toQuery(value: boolean, key: string): string
export function toQuery(value, key) {
    return encodeURI(stringToParam(key) + '=' + encodeURI(toParam(value)));
}
