import {toParam as stringToParam} from 'viking/support/string';
// import { strftime as strftime_ } from '../../strftime';

// // strftime relies on https://github.com/samsonjs/strftime. It supports
// // standard specifiers from C as well as some other extensions from Ruby.
// export function strftime(date: Date, fmt: string): string {
//     return strftime_(fmt, date);
// }

// Alias of toJSON().
//
// export function toParam(value: Date): string
export function toParam(value) {
    return value.toJSON();
}

// export function toQuery(value: Date, key: string): string
export function toQuery(value, key) {
    return encodeURI(stringToParam(key)) + '=' + encodeURI(toParam(value));
}

// export function today(): Date
export function today() {
    return new Date();
}

// export function isToday(value: Date): boolean
export function isToday(value) {
    return value.getUTCFullYear() === (new Date()).getUTCFullYear()
        && value.getUTCMonth() === (new Date()).getUTCMonth()
        && value.getUTCDate() === (new Date()).getUTCDate();
}

// export function isThisMonth(value: Date): boolean
export function isThisMonth(value) {
    return value.getUTCFullYear() === (new Date()).getUTCFullYear()
        && value.getUTCMonth() === (new Date()).getUTCMonth();
}

// export function isThisYear(value: Date): boolean
export function isThisYear(value) {
    return value.getUTCFullYear() === (new Date()).getUTCFullYear();
}

// export function past(value: Date): boolean
export function past(value) {
    return value < (Date.now());
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