import * as string from './string';

// Alias of to_s.
export const toParam = (v: boolean) => v.toString();

export function toQuery(value: boolean, key: string): string {
    return encodeURI(string.toParam(key) + '=' + encodeURI(toParam(value)));
}
