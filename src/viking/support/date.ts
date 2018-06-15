// import { strftime as strftime_ } from '../../strftime';

import {toParam as stringToParam} from './string';

// // strftime relies on https://github.com/samsonjs/strftime. It supports
// // standard specifiers from C as well as some other extensions from Ruby.
// export function strftime(date: Date, fmt: string): string {
//     return strftime_(fmt, date);
// }

// Alias of toJSON().
export function toParam(value: Date): string {
    return value.toJSON();
}

export function toQuery(value: Date, key: string): string {
    return encodeURI(stringToParam(key)) + '=' + encodeURI(toParam(value));
}

export function today(): Date {
    return new Date();
}

export function isToday(value: Date): boolean {
    return value.getUTCFullYear() === (new Date()).getUTCFullYear()
        && value.getUTCMonth() === (new Date()).getUTCMonth()
        && value.getUTCDate() === (new Date()).getUTCDate();
}

export function isThisMonth(value: Date): boolean {
    return value.getUTCFullYear() === (new Date()).getUTCFullYear()
        && value.getUTCMonth() === (new Date()).getUTCMonth();
}

export function isThisYear(value: Date): boolean {
    return value.getUTCFullYear() === (new Date()).getUTCFullYear();
}

export function past(value: Date): boolean {
    return value < (new Date());
}

// class VikingDate extends Date {

//     static today(): VikingDate {
//         return new VikingDate();
//     }

//     strftime(fmt: string): string {
//         return strftime_(fmt, this);
//     }

//     toParam() {
//         return this.toJSON();
//     }

//     toQuery(key: string): string {
//         return toQuery(this, key);
//     }

//     isToday(d): boolean {
//         return isToday(this);
//     }

//     isThisMonth(): boolean {
//         return isThisMonth(this);
//     }

//     isThisYear(): boolean {
//         return isThisYear(this);
//     }

//     past(): boolean {
//         return past(this);
//     }

// }

// export { VikingDate as Date };
