import {toParam as stringToParam} from './string';

// Alias of toString.
//
// export function toParam(value: boolean): string
export function toParam(value) {
    return value.toString();
}

// export function toQuery(value: boolean, key: string): string
export function toQuery(value, key) {
    return encodeURIComponent(stringToParam(key)) + '=' + encodeURIComponent(toParam(value));
}
