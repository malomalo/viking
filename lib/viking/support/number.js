import {toParam as stringToParam} from 'viking/support/string';

// ordinalize returns the ordinal string corresponding to integer:
//
//     (1).ordinalize()    // => '1st'
//     (2).ordinalize()    // => '2nd'
//     (53).ordinalize()   // => '53rd'
//     (2009).ordinalize() // => '2009th'
//     (-134).ordinalize() // => '-134th'
//
// export function ordinalize(value: number): string
export function ordinalize(value) {
    // if (isNaN(value)) {
    //     return value.toString();
    // }

    let abs = Math.abs(value);
    let i = abs % 10;
    let ii = abs % 100;

    if ((ii >= 11 && ii <= 13) || i === 0 || i >= 4) {
        return value + 'th';
    }

    if (i === 1) { return value + 'st'; }
    if (i === 2) { return value + 'nd'; }

    return value + 'rd';
}

// Alias of to_s
//
// export function toParam(value: number): string {
export function toParam(value) {
    return value.toString();
}

// export function toQuery(value: number, key: string): string
export function toQuery(value, key) {
    return encodeURI(stringToParam(key)) + '=' + encodeURI(toParam(value));
}

// export function second(value: number): number
export function second(value) {
    return value * 1000;
}

export const seconds = second;

// export function minute(value: number): number
export function minute(value) {
    return value * 60000;
}

export const minutes = minute;

// export function hour(value: number): number
export function hour(value) {
    return value * 3600000;
}

export const hours = hour;

// export function day(value: number): number
export function day(value) {
    return value * 86400000;
}

export const days = day;

// export function week(value: number): number
export function week(value) {
    return value * 7 * 86400000;
}

export const weeks = week;

// export function ago(value: number): Date
export function ago(value) {
    return new Date((new Date()).getTime() - value);
}

// export function fromNow(value: number): Date
export function fromNow(value) {
    return new Date((new Date()).getTime() + value);
}