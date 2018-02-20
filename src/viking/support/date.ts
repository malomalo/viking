import * as _ from 'underscore';
import { strftime as strftime_ } from '../../strftime';

import * as string from './string';

// strftime relies on https://github.com/samsonjs/strftime. It supports
// standard specifiers from C as well as some other extensions from Ruby.
export function strftime(date: Date, fmt: string): string {
    return strftime_(fmt, date);
}

// Alias of to_s.
export const toParam = (d) => d.toJSON();

export function toQuery(d: Date, key: string): string {
    return encodeURI(string.toParam(key)) + '=' + encodeURI(toParam(d));
}

export function today(): Date {
    return new Date();
}

export function isToday(d: Date): boolean {
    return d.getUTCFullYear() == (new Date()).getUTCFullYear()
        && d.getUTCMonth() == (new Date()).getUTCMonth()
        && d.getUTCDate() == (new Date()).getUTCDate();
}

export function isThisMonth(d: Date): boolean {
    return d.getUTCFullYear() == (new Date()).getUTCFullYear()
        && d.getUTCMonth() == (new Date()).getUTCMonth();
}

export function isThisYear(d: Date): boolean {
    return d.getUTCFullYear() == (new Date()).getUTCFullYear();
}

export function past(d: Date): boolean {
    return d < (new Date());
}
