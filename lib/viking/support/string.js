import { context } from '../context';
import { NameError } from '../errors';
import { singularize, pluralize } from './inflector';

// Converts the first character to uppercase
//
// export function capitalize(value: string): string
export function capitalize(value) {
    return value.charAt(0).toUpperCase() + value.slice(1);
}

// Converts the first character to lowercase
//
// export function anticapitalize(value: string): string
export function anticapitalize(value) {
    return value.charAt(0).toLowerCase() + value.slice(1);
}

// Capitalizes all the words and replaces some characters in the string to
// create a nicer looking title. titleize is meant for creating pretty output.
//
// export function titleize(value: string): string
export function titleize(value) {
    return humanize(underscore(value)).replace(/\b('?[a-z])/g, (m) => m.toUpperCase());
}

// Capitalizes the first word and turns underscores into spaces and strips a
// trailing "_id", if any. Like titleize, this is meant for creating pretty
// output.
//
// export function humanize(value: string): string
export function humanize(value) {
    return capitalize(value.toLowerCase()
        .replace(/_id$/, '')
        .replace(/_/g, ' ')
        .replace(/([a-z\d]*)/g, (m) => m.toLowerCase()));
}

// Makes an underscored, lowercase form from the expression in the string.
//
// Changes '.' to '/' to convert namespaces to paths.
//
// Examples:
// 
//     "ActiveModel".underscore         # => "active_model"
//     "ActiveModel.Errors".underscore # => "active_model/errors"
//
// As a rule of thumb you can think of underscore as the inverse of camelize,
// though there are cases where that does not hold:
//
//     "SSLError".underscore().camelize() # => "SslError"
//
// export function underscore(value: string): string
export function underscore(value) {
    let result = value.replace('.', '/');
    result = result.replace(/([A-Z\d]+)([A-Z][a-z])/g, "$1_$2");
    result = result.replace(/([a-z\d])([A-Z])/g, "$1_$2");
    return result.replace('-', '_').toLowerCase();
}

// By default, #camelize converts strings to UpperCamelCase. If the argument
// to camelize is set to `false` then #camelize produces lowerCamelCase.
//
// \#camelize will also convert "/" to "." which is useful for converting
// paths to namespaces.
//
// Examples:
//
//     "active_model".camelize               // => "ActiveModel"
//     "active_model".camelize(true)         // => "ActiveModel"
//     "active_model".camelize(false)        // => "activeModel"
//     "active_model/errors".camelize        // => "ActiveModel.Errors"
//     "active_model/errors".camelize(false) // => "activeModel.Errors"
//
// As a rule of thumb you can think of camelize as the inverse of underscore,
// though there are cases where that does not hold:
//
//     "SSLError".underscore().camelize()   // => "SslError"
//
// export function camelize(value: string, uppercaseFirstLetter?: boolean): string
export function camelize(value, uppercaseFirstLetter) {
    if (uppercaseFirstLetter === undefined || uppercaseFirstLetter) {
        value = capitalize(value);
    } else {
        value = anticapitalize(value);
    }

    value = value.replace(/(_|(\/))([a-z\d]*)/g, (_a, _b, first, rest) => {
        return (first || '') + capitalize(rest);
    });

    return value.replace('/', '.');
}

// Convert a string to a boolean value. If the argument to #booleanize is
// passed if the string is not 'true' or 'false' it will return the argument.
//
// Examples:
//
//     "true".booleanize()       // => true
//     "false".booleanize()      // => false
//     "other".booleanize()      // => false
//     "other".booleanize(true)  // => true
//
// export function booleanize(value: string, defaultTo?: boolean): boolean
export function booleanize(value, defaultTo) {
    if (value.toString() === 'true') { return true; }
    if (value.toString() === 'false') { return false; }

    return (defaultTo === undefined ? false : defaultTo);
}

// Replaces underscores with dashes.
//
// Example:
//
//     "puni_puni"  // => "puni-puni"
//
// export function dasherize(value: string): string
export function dasherize(value) {
    return value.replace('_', '-');
}

// Replaces special characters in a string so that it may be used as part of
// a "pretty" URL.
//
// Example:
//
//     "Donald E. Knuth".parameterize() // => 'donald-e-knuth'
//
// export function parameterize(value: string, seperator?: string): string
export function parameterize(value, seperator) {
    return value.toLowerCase().replace(/[^a-z0-9\-_]+/g, seperator || '-');
}

// Tries to find a variable with the name specified in context of `context`.
// `context` defaults to the `Viking.context` variable.
//
// Examples:
//     'Module'.constantize     # => Module
//     'Test.Unit'.constantize  # => Test.Unit
//     'Unit'.constantize(Test) # => Test.Unit
//
// Viking.NameError is raised when the variable is unknown.
//
// export function constantize(value: string, lookupContext?: any): any
export function constantize(value, lookupContext) {
    return value.split('.').reduce((ctx, name) => {
        const v = ctx[name];
        if (!v) {
            throw new NameError('uninitialized variable ' + name);
        }
        return v;

    }, lookupContext ? lookupContext : context);
}

// Removes the module part from the expression in the string.
//
// Examples:
//     'Namespaced.Module'.demodulize() # => 'Module'
//     'Module'.demodulize() # => 'Module'
//     ''.demodulize() # => ''
//
// export function demodulize(value: string, seperator: string = '.'): string
export function demodulize(value, seperator = '.') {
    let index = value.lastIndexOf(seperator);

    if (index === -1) {
        return String(value);
    } else {
        return value.slice(index + 1);
    }
}

// If `length` is greater than the length of the string, returns a new String
// of length `length` with the string right justified and padded with padString;
// otherwise, returns string
//
// export function rjust(value: string, length: number, padString: string = ' '): string
export function rjust(value, length, padString = ' ') {
    let padding = '';
    const paddingLength = length - value.length;

    while (padding.length < paddingLength) {
        if (paddingLength - padding.length < padString.length) {
            padding = padding + padString.slice(0, paddingLength - padding.length);
        } else {
            padding = padding + padString;
        }
    }

    return padding + value;
}

// If `length` is greater than the length of the string, returns a new String
// of length `length` with the string left justified and padded with padString;
// otherwise, returns string
//
// export function ljust(value: string, length: number, padString: string = ' '): string
export function ljust(value, length, padString = ' ') {
    let padding = '';
    const paddingLength = length - value.length;

    while (padding.length < paddingLength) {
        if (paddingLength - padding.length < padString.length) {
            padding = padding + padString.slice(0, paddingLength - padding.length);
        } else {
            padding = padding + padString;
        }
    }

    return value + padding;
}

// export function toParam(value): string
export function toParam(value) {
    return value.toString();
}

// export function toQuery(value: string, key: string): string
export function toQuery(value, key) {
    return encodeURIComponent(toParam(key)) + '=' + encodeURIComponent(toParam(value));
}


// Add Viking.Inflector #singularize and #pluralize function on the String object
export {singularize, pluralize}