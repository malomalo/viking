import { NameError } from '../errors';

// Converts the first character to uppercase
String.prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
};

// Converts the first character to lowercase
String.prototype.anticapitalize = function() {
    return this.charAt(0).toLowerCase() + this.slice(1);
};

// Capitalizes all the words and replaces some characters in the string to
// create a nicer looking title. titleize is meant for creating pretty output.
String.prototype.titleize = function() {
    return this.underscore().humanize().replace(/\b('?[a-z])/g, function(m){ return m.toUpperCase(); });
};

// Capitalizes the first word and turns underscores into spaces and strips a
// trailing "_id", if any. Like titleize, this is meant for creating pretty output.
String.prototype.humanize = function() {
    let result = this.toLowerCase().replace(/_id$/, '').replace(/_/g, ' ');
    result = result.replace(/([a-z\d]*)/g, function(m) { return m.toLowerCase(); });
    return result.capitalize();
};

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
String.prototype.underscore = function() {
    let result = this.replace('.', '/');
    result = result.replace(/([A-Z\d]+)([A-Z][a-z])/g, "$1_$2");
    result = result.replace(/([a-z\d])([A-Z])/g, "$1_$2");
    return result.replace('-', '_').toLowerCase();
};

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
String.prototype.camelize = function(uppercase_first_letter) {
    let result;

    if (uppercase_first_letter === undefined || uppercase_first_letter) {
        result = this.capitalize();
    } else {
        result = this.anticapitalize();
    }

    result = result.replace(/(_|(\/))([a-z\d]*)/g, function(_a, _b, first, rest) {
        return (first || '') + rest.capitalize();
    });

    return result.replace('/', '.');
};

// Convert a string to a boolean value. If the argument to #booleanize is
// passed if the string is not 'true' or 'false' it will return the argument.
//
// Examples:
//
//     "true".booleanize()       // => true
//     "false".booleanize()      // => false
//     "other".booleanize()      // => false
//     "other".booleanize(true)  // => true
String.prototype.booleanize = function(defaultTo) {
    if(this.toString() === 'true') { return true; }
    if (this.toString() === 'false') { return false; }
    
    return (defaultTo === undefined ? false : defaultTo);
};

// Replaces underscores with dashes.
//
// Example:
//
//     "puni_puni"  // => "puni-puni"
String.prototype.dasherize = function() {
    return this.replace('_', '-');
};

// Replaces special characters in a string so that it may be used as part of
// a "pretty" URL.
//
// Example:
//
//     "Donald E. Knuth".parameterize() // => 'donald-e-knuth'
String.prototype.parameterize = function(seperator) {
    return this.toLowerCase().replace(/[^a-z0-9\-_]+/g, seperator || '-');
};

// Add Underscore.inflection#pluralize function on the String object
String.prototype.pluralize = function(count, includeNumber) {
    return _.pluralize(this, count, includeNumber);
};

// Add Underscore.inflection#singularize function on the String object
String.prototype.singularize = function() {
    return _.singularize(this);
};

// Tries to find a variable with the name specified in context of `context`.
// `context` defaults to the `window` variable.
//
// Examples:
//     'Module'.constantize     # => Module
//     'Test.Unit'.constantize  # => Test.Unit
//     'Unit'.constantize(Test) # => Test.Unit
//
// Viking.NameError is raised when the variable is unknown.
String.prototype.constantize = function(context) {
    if(!context) { context = window; }

    return this.split('.').reduce(function (context, name) {
        let v = context[name];
        if (!v) {
            throw new NameError("uninitialized variable " + name); 
        }
        return v;
    }, context);
};

// Removes the module part from the expression in the string.
//
// Examples:
//     'Namespaced.Module'.demodulize() # => 'Module'
//     'Module'.demodulize() # => 'Module'
//     ''.demodulize() # => ''
String.prototype.demodulize = function (seperator) {
    if (!seperator) {
        seperator = '.';
    }

    let index = this.lastIndexOf(seperator);

    if (index === -1) {
        return String(this);
    } else {
        return this.slice(index + 1);
    }
}

// If `length` is greater than the length of the string, returns a new String
// of length `length` with the string right justified and padded with padString;
// otherwise, returns string
String.prototype.rjust = function(length, padString) {
    if (!padString) { padString = ' '; }
    
    let padding = '';
    let paddingLength = length - this.length;

    while (padding.length < paddingLength) {
        if (paddingLength - padding.length < padString.length) {
            padding = padding + padString.slice(0, paddingLength - padding.length);
        } else {
            padding = padding + padString;
        }
    }

    return padding + this;
};

// If `length` is greater than the length of the string, returns a new String
// of length `length` with the string left justified and padded with padString;
// otherwise, returns string
String.prototype.ljust = function(length, padString) {
    if (!padString) { padString = ' '; }
    
    let padding = '';
    let paddingLength = length - this.length;

    while (padding.length < paddingLength) {
        if (paddingLength - padding.length < padString.length) {
            padding = padding + padString.slice(0, paddingLength - padding.length);
        } else {
            padding = padding + padString;
        }
    }

    return this + padding;
};

// Alias of to_s.
String.prototype.toParam = String.prototype.toString;

String.prototype.toQuery = function(key) {
	return escape(key.toParam()) + "=" + escape(this.toParam());
};

String.prototype.downcase = String.prototype.toLowerCase;
