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
// trailing “_id”, if any. Like titleize, this is meant for creating pretty output.
String.prototype.humanize = function() {
    var result = this.toLowerCase().replace(/_id$/, '').replace(/_/g, ' ');
    result = result.replace(/([a-z\d]*)/g, function(m) { return m.toLowerCase(); });
    return result.capitalize();
};

// Makes an underscored, lowercase form from the expression in the string.
//
// Changes ‘::’ to ‘/’ to convert namespaces to paths.
//
// Examples:
// 
//    "ActiveModel".underscore         # => "active_model"
//    "ActiveModel::Errors".underscore # => "active_model/errors"
//
// As a rule of thumb you can think of underscore as the inverse of camelize,
// though there are cases where that does not hold:
//
//     "SSLError".underscore().camelize() # => "SslError"
String.prototype.underscore = function() {
    var result = this.replace('::', '/');
    result = result.replace(/([A-Z\d]+)([A-Z][a-z])/g, "$1_$2");
    result = result.replace(/([a-z\d])([A-Z])/g, "$1_$2");
    return result.replace('-','_').toLowerCase();
};

// By default, camelize converts strings to UpperCamelCase. If the argument
// to camelize is set to :lower then camelize produces lowerCamelCase.
//
// camelize will also convert '/' to '::' which is useful for converting paths
// to namespaces.
//
// Examples:
//
//    "active_model".camelize                # => "ActiveModel"
//    "active_model".camelize(:lower)        # => "activeModel"
//    "active_model/errors".camelize         # => "ActiveModel::Errors"
//    "active_model/errors".camelize(:lower) # => "activeModel::Errors"
//
// As a rule of thumb you can think of camelize as the inverse of underscore,
// though there are cases where that does not hold:
//
//    "SSLError".underscore.camelize # => "SslError"
String.prototype.camelize = function(uppercase_first_letter) {
    var result = uppercase_first_letter !== undefined ? this.capitalize() : this.anticapitalize();
    result = result.replace(/(_|(\/))([a-z\d]*)/g, function() { return (arguments[2] || '') + arguments[3].capitalize(); });
    return result.replace('/', '::');
};

// Convert a string to a boolean value. If the argument to booleanize() is
// passed if the string is not 'true' or 'false' it will return the argument
//
// Examples:
//
//    "true".booleanize()       # => true
//    "false".booleanize()      # => false
//    "other".booleanize()      # => false
//    "other".booleanize(true)  # => true
String.prototype.booleanize = function(defaultTo) {
    if(this == 'true') {
        return true;
    } else if (this == 'false') {
        return false;
    } else {
        return (defaultTo === undefined ? false : defaultTo);
    }
};

// Replaces underscores with dashes in the string.
//
// Example:
//
//    "puni_puni" # => "puni-puni"
String.prototype.dasherize = function() {
    return this.replace('_','-');
};

// Replaces special characters in a string so that it may be used as part of a ‘pretty’ URL.
//
// Example:
//
// "Donald E. Knuth".parameterize() # => 'donald-e-knuth'
String.prototype.parameterize = function(seperator) {
    return this.toLowerCase().replace(/[^a-z0-9\-_]+/g, seperator || '-');
};

// Binding on string for _.inflection
String.prototype.pluralize = function(count, includeNumber) {
    return _.pluralize(this, count, includeNumber);
};
String.prototype.singularize = function() {
    return _.singularize(this);
};