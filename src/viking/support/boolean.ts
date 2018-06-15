import {toParam as stringToParam} from './string';

// Alias of to_s.
export function toParam(value: boolean): string {
    return value.toString();
}

export function toQuery(value: boolean, key: string): string {
    return encodeURI(stringToParam(key) + '=' + encodeURI(toParam(value)));
}
