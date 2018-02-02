import * as _ from 'underscore';
import * as string from './string';

// ordinalize returns the ordinal string corresponding to integer:
//
//     (1).ordinalize()    // => '1st'
//     (2).ordinalize()    // => '2nd'
//     (53).ordinalize()   // => '53rd'
//     (2009).ordinalize() // => '2009th'
//     (-134).ordinalize() // => '-134th'
export function ordinalize(value: number): string {
    var abs = Math.abs(value);

    if (abs % 100 >= 11 && abs % 100 <= 13) {
        return value + 'th';
    }

    abs = abs % 10;
    if (abs === 1) { return value + 'st'; }
    if (abs === 2) { return value + 'nd'; }
    if (abs === 3) { return value + 'rd'; }

    return value + 'th';
};

// Alias of to_s.
export const toParam = (v: number): string => v.toString();

export function toQuery(value: number, key: string): string {
    return encodeURI(string.toParam(key)) + '=' + encodeURI(toParam(value));
}

export function second(value: number): number {
    return value * 1000;
};

export const seconds = second;

export function minute(value: number): number {
    return value * 60000;
};

export const minutes = minute;

export function hour(value: number): number {
    return value * 3600000;
};

export const hours = hour;

export function day(value: number): number {
    return value * 86400000;
};

export const days = day;

export function week(value: number): number {
    return value * 7 * 86400000;
};

export const weeks = week;

export function ago(value: number): Date {
    return new Date((new Date()).getTime() - value);
};

export function fromNow(value: number): Date {
    return new Date((new Date()).getTime() + value);
};
