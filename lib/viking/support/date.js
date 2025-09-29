import {toParam as stringToParam} from './string';
// import { strftime as strftime_ } from '../../strftime';

/**
 * @module Support.Date
 * @memberof Support
 * @ignore
 */

// // strftime relies on https://github.com/samsonjs/strftime. It supports
// // standard specifiers from C as well as some other extensions from Ruby.
// export function strftime(date: Date, fmt: string): string {
//     return strftime_(fmt, date);
// }

/**
 * Converts a Date to a string parameter
 * Alias of toJSON().
 * 
 * @ignore
 * @param {Date} value - The date to convert
 * @returns {string} ISO string representation of the date
 */
export function toParam(value) {
    return value.toJSON();
}

/**
 * Converts a Date to a URL query parameter
 * 
 * @ignore
 * @param {Date} value - The date to convert
 * @param {string} key - The key for the query parameter
 * @returns {string} URL query parameter in the form key=value
 */
export function toQuery(value, key) {
    return encodeURIComponent(stringToParam(key)) + '=' + encodeURIComponent(toParam(value));
}

/**
 * Returns the current date
 * 
 * @ignore
 * @returns {Date} The current date
 */
export function today() {
    return new Date();
}

/**
 * Checks if a date is today
 * 
 * @ignore
 * @param {Date} value - The date to check
 * @returns {boolean} True if the date is today, false otherwise
 */
export function isToday(value) {
    return value.getUTCFullYear() === (new Date()).getUTCFullYear()
        && value.getUTCMonth() === (new Date()).getUTCMonth()
        && value.getUTCDate() === (new Date()).getUTCDate();
}

/**
 * Checks if a date is in the current month
 * 
 * @ignore
 * @param {Date} value - The date to check
 * @returns {boolean} True if the date is in the current month, false otherwise
 */
export function isThisMonth(value) {
    return value.getUTCFullYear() === (new Date()).getUTCFullYear()
        && value.getUTCMonth() === (new Date()).getUTCMonth();
}

/**
 * Checks if a date is in the current year
 * 
 * @ignore
 * @param {Date} value - The date to check
 * @returns {boolean} True if the date is in the current year, false otherwise
 */
export function isThisYear(value) {
    return value.getUTCFullYear() === (new Date()).getUTCFullYear();
}

/**
 * Checks if a date is in the past
 * 
 * @ignore
 * @param {Date} value - The date to check
 * @returns {boolean} True if the date is in the past, false otherwise
 */
export function past(value) {
    return value < (Date.now());
}

/**
 * Converts a date to an ISO date string (YYYY-MM-DD)
 * 
 * @ignore
 * @param {Date} value - The date to convert
 * @returns {string} ISO date string in the format YYYY-MM-DD
 */
export function toISODateString (value) {
    var month = value.getMonth()+1 + '';
    if(month.length == 1) month = '0' + month;
    var date = value.getDate()+'';
    if(date.length == 1) date = '0' + date;
    return [value.getUTCFullYear(), month , date].join("-")
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