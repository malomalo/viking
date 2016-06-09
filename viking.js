var Viking = (function () {
	'use strict';

	// Calls `to_param` on all its elements and joins the result with slashes.
	// This is used by url_for in Viking Pack.
	Object.defineProperty(Array.prototype, 'toParam', {
	    value: function value() {
	        return this.map(function (e) {
	            return e.toParam();
	        }).join('/');
	    },
	    writable: true,
	    configureable: true,
	    enumerable: false
	});

	// Converts an array into a string suitable for use as a URL query string,
	// using the given key as the param name.
	Object.defineProperty(Array.prototype, 'toQuery', {
	    value: function value(key) {
	        var prefix = key + "[]";
	        return this.map(function (value) {
	            if (value === null) {
	                return escape(prefix) + '=';
	            }
	            return value.toQuery(prefix);
	        }).join('&');
	    },
	    writable: true,
	    configureable: true,
	    enumerable: false
	});

	// Alias of to_s.
	Boolean.prototype.toParam = Boolean.prototype.toString;

	Boolean.prototype.toQuery = function (key) {
		return escape(key.toParam()) + "=" + escape(this.toParam());
	};

	// strftime relies on https://github.com/samsonjs/strftime. It supports
	// standard specifiers from C as well as some other extensions from Ruby.
	Date.prototype.strftime = function (fmt) {
	    return strftime(fmt, this);
	};

	Date.fromISO = function (s) {
	    return new Date(s);
	};

	// Alias of to_s.
	Date.prototype.toParam = Date.prototype.toJSON;

	Date.prototype.toQuery = function (key) {
	    return escape(key.toParam()) + "=" + escape(this.toParam());
	};

	Date.prototype.today = function () {
	    return new Date();
	};

	Date.prototype.isToday = function () {
	    return this.getUTCFullYear() === new Date().getUTCFullYear() && this.getUTCMonth() === new Date().getUTCMonth() && this.getUTCDate() === new Date().getUTCDate();
	};

	Date.prototype.isThisMonth = function () {
	    return this.getUTCFullYear() === new Date().getUTCFullYear() && this.getUTCMonth() === new Date().getUTCMonth();
	};

	Date.prototype.isThisYear = function () {
	    return this.getUTCFullYear() === new Date().getUTCFullYear();
	};

	Date.prototype.past = function () {
	    return this < new Date();
	};

	// ordinalize returns the ordinal string corresponding to integer:
	//
	//     (1).ordinalize()    // => '1st'
	//     (2).ordinalize()    // => '2nd'
	//     (53).ordinalize()   // => '53rd'
	//     (2009).ordinalize() // => '2009th'
	//     (-134).ordinalize() // => '-134th'
	Number.prototype.ordinalize = function () {
	    var abs = Math.abs(this);

	    if (abs % 100 >= 11 && abs % 100 <= 13) {
	        return this + 'th';
	    }

	    abs = abs % 10;
	    if (abs === 1) {
	        return this + 'st';
	    }
	    if (abs === 2) {
	        return this + 'nd';
	    }
	    if (abs === 3) {
	        return this + 'rd';
	    }

	    return this + 'th';
	};

	// Alias of to_s.
	Number.prototype.toParam = Number.prototype.toString;

	Number.prototype.toQuery = function (key) {
	    return escape(key.toParam()) + "=" + escape(this.toParam());
	};

	Number.prototype.second = function () {
	    return this * 1000;
	};

	Number.prototype.seconds = Number.prototype.second;

	Number.prototype.minute = function () {
	    return this * 60000;
	};

	Number.prototype.minutes = Number.prototype.minute;

	Number.prototype.hour = function () {
	    return this * 3600000;
	};

	Number.prototype.hours = Number.prototype.hour;

	Number.prototype.day = function () {
	    return this * 86400000;
	};

	Number.prototype.days = Number.prototype.day;

	Number.prototype.week = function () {
	    return this * 7 * 86400000;
	};

	Number.prototype.weeks = Number.prototype.week;

	Number.prototype.ago = function () {
	    return new Date(new Date().getTime() - this);
	};

	Number.prototype.fromNow = function () {
	    return new Date(new Date().getTime() + this);
	};

	// Returns a string representation of the receiver suitable for use as a URL
	// query string:
	//
	// {name: 'David', nationality: 'Danish'}.toParam()
	// // => "name=David&nationality=Danish"
	// An optional namespace can be passed to enclose the param names:
	//
	// {name: 'David', nationality: 'Danish'}.toParam('user')
	// // => "user[name]=David&user[nationality]=Danish"
	//
	// The string pairs "key=value" that conform the query string are sorted
	// lexicographically in ascending order.
	Object.defineProperty(Object.prototype, 'toParam', {
	    writable: true,
	    configureable: true,
	    enumerable: false,
	    value: function value(namespace) {
	        var _this = this;

	        return Object.keys(this).map(function (key) {
	            var value = _this[key];
	            var namespaceWithKey = namespace ? namespace + "[" + key + "]" : key;

	            if (value === null || value === undefined) {
	                return escape(namespaceWithKey);
	            } else {
	                return value.toQuery(namespaceWithKey);
	            }
	        }).join('&');
	    }
	});

	// Converts an object into a string suitable for use as a URL query string,
	// using the given key as the param name.
	//
	// Note: This method is defined as a default implementation for all Objects for
	// Object#toQuery to work.
	Object.defineProperty(Object.prototype, 'toQuery', {
	    writable: true,
	    configureable: true,
	    enumerable: false,
	    value: Object.prototype.toParam
	});

	// Converts the first character to uppercase
	String.prototype.capitalize = function () {
	    return this.charAt(0).toUpperCase() + this.slice(1);
	};

	// Converts the first character to lowercase
	String.prototype.anticapitalize = function () {
	    return this.charAt(0).toLowerCase() + this.slice(1);
	};

	// Capitalizes all the words and replaces some characters in the string to
	// create a nicer looking title. titleize is meant for creating pretty output.
	String.prototype.titleize = function () {
	    return this.underscore().humanize().replace(/\b('?[a-z])/g, function (m) {
	        return m.toUpperCase();
	    });
	};

	// Capitalizes the first word and turns underscores into spaces and strips a
	// trailing "_id", if any. Like titleize, this is meant for creating pretty output.
	String.prototype.humanize = function () {
	    var result = this.toLowerCase().replace(/_id$/, '').replace(/_/g, ' ');
	    result = result.replace(/([a-z\d]*)/g, function (m) {
	        return m.toLowerCase();
	    });
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
	String.prototype.underscore = function () {
	    var result = this.replace('.', '/');
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
	String.prototype.camelize = function (uppercase_first_letter) {
	    var result = void 0;

	    if (uppercase_first_letter === undefined || uppercase_first_letter) {
	        result = this.capitalize();
	    } else {
	        result = this.anticapitalize();
	    }

	    result = result.replace(/(_|(\/))([a-z\d]*)/g, function (_a, _b, first, rest) {
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
	String.prototype.booleanize = function (defaultTo) {
	    if (this.toString() === 'true') {
	        return true;
	    }
	    if (this.toString() === 'false') {
	        return false;
	    }

	    return defaultTo === undefined ? false : defaultTo;
	};

	// Replaces underscores with dashes.
	//
	// Example:
	//
	//     "puni_puni"  // => "puni-puni"
	String.prototype.dasherize = function () {
	    return this.replace('_', '-');
	};

	// Replaces special characters in a string so that it may be used as part of
	// a "pretty" URL.
	//
	// Example:
	//
	//     "Donald E. Knuth".parameterize() // => 'donald-e-knuth'
	String.prototype.parameterize = function (seperator) {
	    return this.toLowerCase().replace(/[^a-z0-9\-_]+/g, seperator || '-');
	};

	// Add Underscore.inflection#pluralize function on the String object
	String.prototype.pluralize = function (count, includeNumber) {
	    return _.pluralize(this, count, includeNumber);
	};

	// Add Underscore.inflection#singularize function on the String object
	String.prototype.singularize = function () {
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
	String.prototype.constantize = function (context) {
	    if (!context) {
	        context = window;
	    }

	    return this.split('.').reduce(function (context, name) {
	        var v = context[name];
	        if (!v) {
	            throw new Viking.NameError("uninitialized variable " + name);
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

	    var index = this.lastIndexOf(seperator);

	    if (index === -1) {
	        return String(this);
	    } else {
	        return this.slice(index + 1);
	    }
	};

	// If `length` is greater than the length of the string, returns a new String
	// of length `length` with the string right justified and padded with padString;
	// otherwise, returns string
	String.prototype.rjust = function (length, padString) {
	    if (!padString) {
	        padString = ' ';
	    }

	    var padding = '';
	    var paddingLength = length - this.length;

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
	String.prototype.ljust = function (length, padString) {
	    if (!padString) {
	        padString = ' ';
	    }

	    var padding = '';
	    var paddingLength = length - this.length;

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

	String.prototype.toQuery = function (key) {
	    return escape(key.toParam()) + "=" + escape(this.toParam());
	};

	String.prototype.downcase = String.prototype.toLowerCase;

	var Model = { test: 42, a: function a() {
	    return 3;
	  } };

	var Viking$1 = {
	    Model: Model
	};

	return Viking$1;

}());
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjpudWxsLCJzb3VyY2VzIjpbIi9Vc2Vycy93YXJhdHVtYW4vc3JjL3Zpa2luZy9saWIvdmlraW5nL3N1cHBvcnQvYXJyYXkuanMiLCIvVXNlcnMvd2FyYXR1bWFuL3NyYy92aWtpbmcvbGliL3Zpa2luZy9zdXBwb3J0L2Jvb2xlYW4uanMiLCIvVXNlcnMvd2FyYXR1bWFuL3NyYy92aWtpbmcvbGliL3Zpa2luZy9zdXBwb3J0L2RhdGUuanMiLCIvVXNlcnMvd2FyYXR1bWFuL3NyYy92aWtpbmcvbGliL3Zpa2luZy9zdXBwb3J0L251bWJlci5qcyIsIi9Vc2Vycy93YXJhdHVtYW4vc3JjL3Zpa2luZy9saWIvdmlraW5nL3N1cHBvcnQvb2JqZWN0LmpzIiwiL1VzZXJzL3dhcmF0dW1hbi9zcmMvdmlraW5nL2xpYi92aWtpbmcvc3VwcG9ydC9zdHJpbmcuanMiLCIvVXNlcnMvd2FyYXR1bWFuL3NyYy92aWtpbmcvbGliL3Zpa2luZy9tb2RlbC5qcyIsIi9Vc2Vycy93YXJhdHVtYW4vc3JjL3Zpa2luZy9saWIvdmlraW5nLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENhbGxzIGB0b19wYXJhbWAgb24gYWxsIGl0cyBlbGVtZW50cyBhbmQgam9pbnMgdGhlIHJlc3VsdCB3aXRoIHNsYXNoZXMuXG4vLyBUaGlzIGlzIHVzZWQgYnkgdXJsX2ZvciBpbiBWaWtpbmcgUGFjay5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShBcnJheS5wcm90b3R5cGUsICd0b1BhcmFtJywge1xuICAgIHZhbHVlOiBmdW5jdGlvbiAoKSB7IHJldHVybiB0aGlzLm1hcCgoZSkgPT4gZS50b1BhcmFtKCkpLmpvaW4oJy8nKTsgfSxcbiAgICB3cml0YWJsZTogdHJ1ZSxcbiAgICBjb25maWd1cmVhYmxlOiB0cnVlLFxuICAgIGVudW1lcmFibGU6IGZhbHNlXG59KTtcblxuLy8gQ29udmVydHMgYW4gYXJyYXkgaW50byBhIHN0cmluZyBzdWl0YWJsZSBmb3IgdXNlIGFzIGEgVVJMIHF1ZXJ5IHN0cmluZyxcbi8vIHVzaW5nIHRoZSBnaXZlbiBrZXkgYXMgdGhlIHBhcmFtIG5hbWUuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoQXJyYXkucHJvdG90eXBlLCAndG9RdWVyeScsIHtcbiAgICB2YWx1ZTogZnVuY3Rpb24gKGtleSkge1xuICAgICAgICBsZXQgcHJlZml4ID0ga2V5ICsgXCJbXVwiO1xuICAgICAgICByZXR1cm4gdGhpcy5tYXAoZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgICAgICBpZiAodmFsdWUgPT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZXNjYXBlKHByZWZpeCkgKyAnPSc7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gdmFsdWUudG9RdWVyeShwcmVmaXgpO1xuICAgICAgICB9KS5qb2luKCcmJyk7XG4gICAgfSxcbiAgICB3cml0YWJsZTogdHJ1ZSxcbiAgICBjb25maWd1cmVhYmxlOiB0cnVlLFxuICAgIGVudW1lcmFibGU6IGZhbHNlXG59KTtcbiIsIi8vIEFsaWFzIG9mIHRvX3MuXG5Cb29sZWFuLnByb3RvdHlwZS50b1BhcmFtID0gQm9vbGVhbi5wcm90b3R5cGUudG9TdHJpbmc7XG5cbkJvb2xlYW4ucHJvdG90eXBlLnRvUXVlcnkgPSBmdW5jdGlvbihrZXkpIHtcblx0cmV0dXJuIGVzY2FwZShrZXkudG9QYXJhbSgpKSArIFwiPVwiICsgZXNjYXBlKHRoaXMudG9QYXJhbSgpKTtcbn07IiwiLy8gc3RyZnRpbWUgcmVsaWVzIG9uIGh0dHBzOi8vZ2l0aHViLmNvbS9zYW1zb25qcy9zdHJmdGltZS4gSXQgc3VwcG9ydHNcbi8vIHN0YW5kYXJkIHNwZWNpZmllcnMgZnJvbSBDIGFzIHdlbGwgYXMgc29tZSBvdGhlciBleHRlbnNpb25zIGZyb20gUnVieS5cbkRhdGUucHJvdG90eXBlLnN0cmZ0aW1lID0gZnVuY3Rpb24oZm10KSB7XG4gICAgcmV0dXJuIHN0cmZ0aW1lKGZtdCwgdGhpcyk7XG59O1xuXG5EYXRlLmZyb21JU08gPSAocykgPT4gbmV3IERhdGUocyk7XG5cbi8vIEFsaWFzIG9mIHRvX3MuXG5EYXRlLnByb3RvdHlwZS50b1BhcmFtID0gRGF0ZS5wcm90b3R5cGUudG9KU09OO1xuXG5EYXRlLnByb3RvdHlwZS50b1F1ZXJ5ID0gZnVuY3Rpb24oa2V5KSB7XG4gICAgcmV0dXJuIGVzY2FwZShrZXkudG9QYXJhbSgpKSArIFwiPVwiICsgZXNjYXBlKHRoaXMudG9QYXJhbSgpKTtcbn07XG5cbkRhdGUucHJvdG90eXBlLnRvZGF5ID0gKCkgPT4gbmV3IERhdGUoKTtcblxuRGF0ZS5wcm90b3R5cGUuaXNUb2RheSA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiAodGhpcy5nZXRVVENGdWxsWWVhcigpID09PSAobmV3IERhdGUoKSkuZ2V0VVRDRnVsbFllYXIoKSAmJiB0aGlzLmdldFVUQ01vbnRoKCkgPT09IChuZXcgRGF0ZSgpKS5nZXRVVENNb250aCgpICYmIHRoaXMuZ2V0VVRDRGF0ZSgpID09PSAobmV3IERhdGUoKSkuZ2V0VVRDRGF0ZSgpKTtcbn07XG5cbkRhdGUucHJvdG90eXBlLmlzVGhpc01vbnRoID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiAodGhpcy5nZXRVVENGdWxsWWVhcigpID09PSAobmV3IERhdGUoKSkuZ2V0VVRDRnVsbFllYXIoKSAmJiB0aGlzLmdldFVUQ01vbnRoKCkgPT09IChuZXcgRGF0ZSgpKS5nZXRVVENNb250aCgpKTtcbn1cblxuRGF0ZS5wcm90b3R5cGUuaXNUaGlzWWVhciA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiAodGhpcy5nZXRVVENGdWxsWWVhcigpID09PSAobmV3IERhdGUoKSkuZ2V0VVRDRnVsbFllYXIoKSk7XG59O1xuXG5cbkRhdGUucHJvdG90eXBlLnBhc3QgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuICh0aGlzIDwgKG5ldyBEYXRlKCkpKTtcbn0iLCIvLyBvcmRpbmFsaXplIHJldHVybnMgdGhlIG9yZGluYWwgc3RyaW5nIGNvcnJlc3BvbmRpbmcgdG8gaW50ZWdlcjpcbi8vXG4vLyAgICAgKDEpLm9yZGluYWxpemUoKSAgICAvLyA9PiAnMXN0J1xuLy8gICAgICgyKS5vcmRpbmFsaXplKCkgICAgLy8gPT4gJzJuZCdcbi8vICAgICAoNTMpLm9yZGluYWxpemUoKSAgIC8vID0+ICc1M3JkJ1xuLy8gICAgICgyMDA5KS5vcmRpbmFsaXplKCkgLy8gPT4gJzIwMDl0aCdcbi8vICAgICAoLTEzNCkub3JkaW5hbGl6ZSgpIC8vID0+ICctMTM0dGgnXG5OdW1iZXIucHJvdG90eXBlLm9yZGluYWxpemUgPSBmdW5jdGlvbigpIHtcbiAgICBsZXQgYWJzID0gTWF0aC5hYnModGhpcyk7XG4gICAgXG4gICAgaWYgKGFicyAlIDEwMCA+PSAxMSAmJiBhYnMgJSAxMDAgPD0gMTMpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMgKyAndGgnO1xuICAgIH1cbiAgICBcbiAgICBhYnMgPSBhYnMgJSAxMDtcbiAgICBpZiAoYWJzID09PSAxKSB7IHJldHVybiB0aGlzICsgJ3N0JzsgfVxuICAgIGlmIChhYnMgPT09IDIpIHsgcmV0dXJuIHRoaXMgKyAnbmQnOyB9XG4gICAgaWYgKGFicyA9PT0gMykgeyByZXR1cm4gdGhpcyArICdyZCc7IH1cbiAgICBcbiAgICByZXR1cm4gdGhpcyArICd0aCc7XG59O1xuXG4vLyBBbGlhcyBvZiB0b19zLlxuTnVtYmVyLnByb3RvdHlwZS50b1BhcmFtID0gTnVtYmVyLnByb3RvdHlwZS50b1N0cmluZztcblxuTnVtYmVyLnByb3RvdHlwZS50b1F1ZXJ5ID0gZnVuY3Rpb24oa2V5KSB7XG4gICAgcmV0dXJuIGVzY2FwZShrZXkudG9QYXJhbSgpKSArIFwiPVwiICsgZXNjYXBlKHRoaXMudG9QYXJhbSgpKTtcbn07XG5cbk51bWJlci5wcm90b3R5cGUuc2Vjb25kID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMgKiAxMDAwO1xufTtcblxuTnVtYmVyLnByb3RvdHlwZS5zZWNvbmRzID0gTnVtYmVyLnByb3RvdHlwZS5zZWNvbmQ7XG5cbk51bWJlci5wcm90b3R5cGUubWludXRlID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMgKiA2MDAwMDtcbn07XG5cbk51bWJlci5wcm90b3R5cGUubWludXRlcyA9IE51bWJlci5wcm90b3R5cGUubWludXRlO1xuXG5OdW1iZXIucHJvdG90eXBlLmhvdXIgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcyAqIDM2MDAwMDA7XG59O1xuXG5OdW1iZXIucHJvdG90eXBlLmhvdXJzID0gTnVtYmVyLnByb3RvdHlwZS5ob3VyO1xuXG5OdW1iZXIucHJvdG90eXBlLmRheSA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzICogODY0MDAwMDA7XG59O1xuXG5OdW1iZXIucHJvdG90eXBlLmRheXMgPSBOdW1iZXIucHJvdG90eXBlLmRheTtcblxuTnVtYmVyLnByb3RvdHlwZS53ZWVrID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMgKiA3ICogODY0MDAwMDA7XG59O1xuXG5OdW1iZXIucHJvdG90eXBlLndlZWtzID0gTnVtYmVyLnByb3RvdHlwZS53ZWVrO1xuXG5OdW1iZXIucHJvdG90eXBlLmFnbyA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBuZXcgRGF0ZSgobmV3IERhdGUoKSkuZ2V0VGltZSgpIC0gdGhpcyk7XG59O1xuXG5OdW1iZXIucHJvdG90eXBlLmZyb21Ob3cgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gbmV3IERhdGUoKG5ldyBEYXRlKCkpLmdldFRpbWUoKSArIHRoaXMpO1xufTtcbiIsIi8vIFJldHVybnMgYSBzdHJpbmcgcmVwcmVzZW50YXRpb24gb2YgdGhlIHJlY2VpdmVyIHN1aXRhYmxlIGZvciB1c2UgYXMgYSBVUkxcbi8vIHF1ZXJ5IHN0cmluZzpcbi8vIFxuLy8ge25hbWU6ICdEYXZpZCcsIG5hdGlvbmFsaXR5OiAnRGFuaXNoJ30udG9QYXJhbSgpXG4vLyAvLyA9PiBcIm5hbWU9RGF2aWQmbmF0aW9uYWxpdHk9RGFuaXNoXCJcbi8vIEFuIG9wdGlvbmFsIG5hbWVzcGFjZSBjYW4gYmUgcGFzc2VkIHRvIGVuY2xvc2UgdGhlIHBhcmFtIG5hbWVzOlxuLy8gXG4vLyB7bmFtZTogJ0RhdmlkJywgbmF0aW9uYWxpdHk6ICdEYW5pc2gnfS50b1BhcmFtKCd1c2VyJylcbi8vIC8vID0+IFwidXNlcltuYW1lXT1EYXZpZCZ1c2VyW25hdGlvbmFsaXR5XT1EYW5pc2hcIlxuLy9cbi8vIFRoZSBzdHJpbmcgcGFpcnMgXCJrZXk9dmFsdWVcIiB0aGF0IGNvbmZvcm0gdGhlIHF1ZXJ5IHN0cmluZyBhcmUgc29ydGVkXG4vLyBsZXhpY29ncmFwaGljYWxseSBpbiBhc2NlbmRpbmcgb3JkZXIuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoT2JqZWN0LnByb3RvdHlwZSwgJ3RvUGFyYW0nLCB7XG4gICAgd3JpdGFibGU6IHRydWUsXG4gICAgY29uZmlndXJlYWJsZTogdHJ1ZSxcbiAgICBlbnVtZXJhYmxlOiBmYWxzZSxcbiAgICB2YWx1ZTogZnVuY3Rpb24obmFtZXNwYWNlKSB7XG4gICAgICAgIHJldHVybiBPYmplY3Qua2V5cyh0aGlzKS5tYXAoKGtleSkgPT4ge1xuICAgICAgICAgICAgbGV0IHZhbHVlID0gdGhpc1trZXldO1xuICAgICAgICAgICAgbGV0IG5hbWVzcGFjZVdpdGhLZXkgPSAobmFtZXNwYWNlID8gKG5hbWVzcGFjZSArIFwiW1wiICsga2V5ICsgXCJdXCIpIDoga2V5KTtcblxuICAgICAgICAgICAgaWYgKHZhbHVlID09PSBudWxsIHx8IHZhbHVlID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZXNjYXBlKG5hbWVzcGFjZVdpdGhLZXkpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdmFsdWUudG9RdWVyeShuYW1lc3BhY2VXaXRoS2V5KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSkuam9pbignJicpO1xuICAgIH1cbn0pO1xuXG4vLyBDb252ZXJ0cyBhbiBvYmplY3QgaW50byBhIHN0cmluZyBzdWl0YWJsZSBmb3IgdXNlIGFzIGEgVVJMIHF1ZXJ5IHN0cmluZyxcbi8vIHVzaW5nIHRoZSBnaXZlbiBrZXkgYXMgdGhlIHBhcmFtIG5hbWUuXG4vL1xuLy8gTm90ZTogVGhpcyBtZXRob2QgaXMgZGVmaW5lZCBhcyBhIGRlZmF1bHQgaW1wbGVtZW50YXRpb24gZm9yIGFsbCBPYmplY3RzIGZvclxuLy8gT2JqZWN0I3RvUXVlcnkgdG8gd29yay5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShPYmplY3QucHJvdG90eXBlLCAndG9RdWVyeScsIHtcbiAgICB3cml0YWJsZTogdHJ1ZSxcbiAgICBjb25maWd1cmVhYmxlOiB0cnVlLFxuICAgIGVudW1lcmFibGU6IGZhbHNlLFxuICAgIHZhbHVlOiBPYmplY3QucHJvdG90eXBlLnRvUGFyYW1cbn0pOyIsIi8vIENvbnZlcnRzIHRoZSBmaXJzdCBjaGFyYWN0ZXIgdG8gdXBwZXJjYXNlXG5TdHJpbmcucHJvdG90eXBlLmNhcGl0YWxpemUgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy5jaGFyQXQoMCkudG9VcHBlckNhc2UoKSArIHRoaXMuc2xpY2UoMSk7XG59O1xuXG4vLyBDb252ZXJ0cyB0aGUgZmlyc3QgY2hhcmFjdGVyIHRvIGxvd2VyY2FzZVxuU3RyaW5nLnByb3RvdHlwZS5hbnRpY2FwaXRhbGl6ZSA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLmNoYXJBdCgwKS50b0xvd2VyQ2FzZSgpICsgdGhpcy5zbGljZSgxKTtcbn07XG5cbi8vIENhcGl0YWxpemVzIGFsbCB0aGUgd29yZHMgYW5kIHJlcGxhY2VzIHNvbWUgY2hhcmFjdGVycyBpbiB0aGUgc3RyaW5nIHRvXG4vLyBjcmVhdGUgYSBuaWNlciBsb29raW5nIHRpdGxlLiB0aXRsZWl6ZSBpcyBtZWFudCBmb3IgY3JlYXRpbmcgcHJldHR5IG91dHB1dC5cblN0cmluZy5wcm90b3R5cGUudGl0bGVpemUgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy51bmRlcnNjb3JlKCkuaHVtYW5pemUoKS5yZXBsYWNlKC9cXGIoJz9bYS16XSkvZywgZnVuY3Rpb24obSl7IHJldHVybiBtLnRvVXBwZXJDYXNlKCk7IH0pO1xufTtcblxuLy8gQ2FwaXRhbGl6ZXMgdGhlIGZpcnN0IHdvcmQgYW5kIHR1cm5zIHVuZGVyc2NvcmVzIGludG8gc3BhY2VzIGFuZCBzdHJpcHMgYVxuLy8gdHJhaWxpbmcgXCJfaWRcIiwgaWYgYW55LiBMaWtlIHRpdGxlaXplLCB0aGlzIGlzIG1lYW50IGZvciBjcmVhdGluZyBwcmV0dHkgb3V0cHV0LlxuU3RyaW5nLnByb3RvdHlwZS5odW1hbml6ZSA9IGZ1bmN0aW9uKCkge1xuICAgIGxldCByZXN1bHQgPSB0aGlzLnRvTG93ZXJDYXNlKCkucmVwbGFjZSgvX2lkJC8sICcnKS5yZXBsYWNlKC9fL2csICcgJyk7XG4gICAgcmVzdWx0ID0gcmVzdWx0LnJlcGxhY2UoLyhbYS16XFxkXSopL2csIGZ1bmN0aW9uKG0pIHsgcmV0dXJuIG0udG9Mb3dlckNhc2UoKTsgfSk7XG4gICAgcmV0dXJuIHJlc3VsdC5jYXBpdGFsaXplKCk7XG59O1xuXG4vLyBNYWtlcyBhbiB1bmRlcnNjb3JlZCwgbG93ZXJjYXNlIGZvcm0gZnJvbSB0aGUgZXhwcmVzc2lvbiBpbiB0aGUgc3RyaW5nLlxuLy9cbi8vIENoYW5nZXMgJy4nIHRvICcvJyB0byBjb252ZXJ0IG5hbWVzcGFjZXMgdG8gcGF0aHMuXG4vL1xuLy8gRXhhbXBsZXM6XG4vLyBcbi8vICAgICBcIkFjdGl2ZU1vZGVsXCIudW5kZXJzY29yZSAgICAgICAgICMgPT4gXCJhY3RpdmVfbW9kZWxcIlxuLy8gICAgIFwiQWN0aXZlTW9kZWwuRXJyb3JzXCIudW5kZXJzY29yZSAjID0+IFwiYWN0aXZlX21vZGVsL2Vycm9yc1wiXG4vL1xuLy8gQXMgYSBydWxlIG9mIHRodW1iIHlvdSBjYW4gdGhpbmsgb2YgdW5kZXJzY29yZSBhcyB0aGUgaW52ZXJzZSBvZiBjYW1lbGl6ZSxcbi8vIHRob3VnaCB0aGVyZSBhcmUgY2FzZXMgd2hlcmUgdGhhdCBkb2VzIG5vdCBob2xkOlxuLy9cbi8vICAgICBcIlNTTEVycm9yXCIudW5kZXJzY29yZSgpLmNhbWVsaXplKCkgIyA9PiBcIlNzbEVycm9yXCJcblN0cmluZy5wcm90b3R5cGUudW5kZXJzY29yZSA9IGZ1bmN0aW9uKCkge1xuICAgIGxldCByZXN1bHQgPSB0aGlzLnJlcGxhY2UoJy4nLCAnLycpO1xuICAgIHJlc3VsdCA9IHJlc3VsdC5yZXBsYWNlKC8oW0EtWlxcZF0rKShbQS1aXVthLXpdKS9nLCBcIiQxXyQyXCIpO1xuICAgIHJlc3VsdCA9IHJlc3VsdC5yZXBsYWNlKC8oW2EtelxcZF0pKFtBLVpdKS9nLCBcIiQxXyQyXCIpO1xuICAgIHJldHVybiByZXN1bHQucmVwbGFjZSgnLScsICdfJykudG9Mb3dlckNhc2UoKTtcbn07XG5cbi8vIEJ5IGRlZmF1bHQsICNjYW1lbGl6ZSBjb252ZXJ0cyBzdHJpbmdzIHRvIFVwcGVyQ2FtZWxDYXNlLiBJZiB0aGUgYXJndW1lbnRcbi8vIHRvIGNhbWVsaXplIGlzIHNldCB0byBgZmFsc2VgIHRoZW4gI2NhbWVsaXplIHByb2R1Y2VzIGxvd2VyQ2FtZWxDYXNlLlxuLy9cbi8vIFxcI2NhbWVsaXplIHdpbGwgYWxzbyBjb252ZXJ0IFwiL1wiIHRvIFwiLlwiIHdoaWNoIGlzIHVzZWZ1bCBmb3IgY29udmVydGluZ1xuLy8gcGF0aHMgdG8gbmFtZXNwYWNlcy5cbi8vXG4vLyBFeGFtcGxlczpcbi8vXG4vLyAgICAgXCJhY3RpdmVfbW9kZWxcIi5jYW1lbGl6ZSAgICAgICAgICAgICAgIC8vID0+IFwiQWN0aXZlTW9kZWxcIlxuLy8gICAgIFwiYWN0aXZlX21vZGVsXCIuY2FtZWxpemUodHJ1ZSkgICAgICAgICAvLyA9PiBcIkFjdGl2ZU1vZGVsXCJcbi8vICAgICBcImFjdGl2ZV9tb2RlbFwiLmNhbWVsaXplKGZhbHNlKSAgICAgICAgLy8gPT4gXCJhY3RpdmVNb2RlbFwiXG4vLyAgICAgXCJhY3RpdmVfbW9kZWwvZXJyb3JzXCIuY2FtZWxpemUgICAgICAgIC8vID0+IFwiQWN0aXZlTW9kZWwuRXJyb3JzXCJcbi8vICAgICBcImFjdGl2ZV9tb2RlbC9lcnJvcnNcIi5jYW1lbGl6ZShmYWxzZSkgLy8gPT4gXCJhY3RpdmVNb2RlbC5FcnJvcnNcIlxuLy9cbi8vIEFzIGEgcnVsZSBvZiB0aHVtYiB5b3UgY2FuIHRoaW5rIG9mIGNhbWVsaXplIGFzIHRoZSBpbnZlcnNlIG9mIHVuZGVyc2NvcmUsXG4vLyB0aG91Z2ggdGhlcmUgYXJlIGNhc2VzIHdoZXJlIHRoYXQgZG9lcyBub3QgaG9sZDpcbi8vXG4vLyAgICAgXCJTU0xFcnJvclwiLnVuZGVyc2NvcmUoKS5jYW1lbGl6ZSgpICAgLy8gPT4gXCJTc2xFcnJvclwiXG5TdHJpbmcucHJvdG90eXBlLmNhbWVsaXplID0gZnVuY3Rpb24odXBwZXJjYXNlX2ZpcnN0X2xldHRlcikge1xuICAgIGxldCByZXN1bHQ7XG5cbiAgICBpZiAodXBwZXJjYXNlX2ZpcnN0X2xldHRlciA9PT0gdW5kZWZpbmVkIHx8IHVwcGVyY2FzZV9maXJzdF9sZXR0ZXIpIHtcbiAgICAgICAgcmVzdWx0ID0gdGhpcy5jYXBpdGFsaXplKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcmVzdWx0ID0gdGhpcy5hbnRpY2FwaXRhbGl6ZSgpO1xuICAgIH1cblxuICAgIHJlc3VsdCA9IHJlc3VsdC5yZXBsYWNlKC8oX3woXFwvKSkoW2EtelxcZF0qKS9nLCBmdW5jdGlvbihfYSwgX2IsIGZpcnN0LCByZXN0KSB7XG4gICAgICAgIHJldHVybiAoZmlyc3QgfHwgJycpICsgcmVzdC5jYXBpdGFsaXplKCk7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gcmVzdWx0LnJlcGxhY2UoJy8nLCAnLicpO1xufTtcblxuLy8gQ29udmVydCBhIHN0cmluZyB0byBhIGJvb2xlYW4gdmFsdWUuIElmIHRoZSBhcmd1bWVudCB0byAjYm9vbGVhbml6ZSBpc1xuLy8gcGFzc2VkIGlmIHRoZSBzdHJpbmcgaXMgbm90ICd0cnVlJyBvciAnZmFsc2UnIGl0IHdpbGwgcmV0dXJuIHRoZSBhcmd1bWVudC5cbi8vXG4vLyBFeGFtcGxlczpcbi8vXG4vLyAgICAgXCJ0cnVlXCIuYm9vbGVhbml6ZSgpICAgICAgIC8vID0+IHRydWVcbi8vICAgICBcImZhbHNlXCIuYm9vbGVhbml6ZSgpICAgICAgLy8gPT4gZmFsc2Vcbi8vICAgICBcIm90aGVyXCIuYm9vbGVhbml6ZSgpICAgICAgLy8gPT4gZmFsc2Vcbi8vICAgICBcIm90aGVyXCIuYm9vbGVhbml6ZSh0cnVlKSAgLy8gPT4gdHJ1ZVxuU3RyaW5nLnByb3RvdHlwZS5ib29sZWFuaXplID0gZnVuY3Rpb24oZGVmYXVsdFRvKSB7XG4gICAgaWYodGhpcy50b1N0cmluZygpID09PSAndHJ1ZScpIHsgcmV0dXJuIHRydWU7IH1cbiAgICBpZiAodGhpcy50b1N0cmluZygpID09PSAnZmFsc2UnKSB7IHJldHVybiBmYWxzZTsgfVxuICAgIFxuICAgIHJldHVybiAoZGVmYXVsdFRvID09PSB1bmRlZmluZWQgPyBmYWxzZSA6IGRlZmF1bHRUbyk7XG59O1xuXG4vLyBSZXBsYWNlcyB1bmRlcnNjb3JlcyB3aXRoIGRhc2hlcy5cbi8vXG4vLyBFeGFtcGxlOlxuLy9cbi8vICAgICBcInB1bmlfcHVuaVwiICAvLyA9PiBcInB1bmktcHVuaVwiXG5TdHJpbmcucHJvdG90eXBlLmRhc2hlcml6ZSA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLnJlcGxhY2UoJ18nLCAnLScpO1xufTtcblxuLy8gUmVwbGFjZXMgc3BlY2lhbCBjaGFyYWN0ZXJzIGluIGEgc3RyaW5nIHNvIHRoYXQgaXQgbWF5IGJlIHVzZWQgYXMgcGFydCBvZlxuLy8gYSBcInByZXR0eVwiIFVSTC5cbi8vXG4vLyBFeGFtcGxlOlxuLy9cbi8vICAgICBcIkRvbmFsZCBFLiBLbnV0aFwiLnBhcmFtZXRlcml6ZSgpIC8vID0+ICdkb25hbGQtZS1rbnV0aCdcblN0cmluZy5wcm90b3R5cGUucGFyYW1ldGVyaXplID0gZnVuY3Rpb24oc2VwZXJhdG9yKSB7XG4gICAgcmV0dXJuIHRoaXMudG9Mb3dlckNhc2UoKS5yZXBsYWNlKC9bXmEtejAtOVxcLV9dKy9nLCBzZXBlcmF0b3IgfHwgJy0nKTtcbn07XG5cbi8vIEFkZCBVbmRlcnNjb3JlLmluZmxlY3Rpb24jcGx1cmFsaXplIGZ1bmN0aW9uIG9uIHRoZSBTdHJpbmcgb2JqZWN0XG5TdHJpbmcucHJvdG90eXBlLnBsdXJhbGl6ZSA9IGZ1bmN0aW9uKGNvdW50LCBpbmNsdWRlTnVtYmVyKSB7XG4gICAgcmV0dXJuIF8ucGx1cmFsaXplKHRoaXMsIGNvdW50LCBpbmNsdWRlTnVtYmVyKTtcbn07XG5cbi8vIEFkZCBVbmRlcnNjb3JlLmluZmxlY3Rpb24jc2luZ3VsYXJpemUgZnVuY3Rpb24gb24gdGhlIFN0cmluZyBvYmplY3RcblN0cmluZy5wcm90b3R5cGUuc2luZ3VsYXJpemUgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gXy5zaW5ndWxhcml6ZSh0aGlzKTtcbn07XG5cbi8vIFRyaWVzIHRvIGZpbmQgYSB2YXJpYWJsZSB3aXRoIHRoZSBuYW1lIHNwZWNpZmllZCBpbiBjb250ZXh0IG9mIGBjb250ZXh0YC5cbi8vIGBjb250ZXh0YCBkZWZhdWx0cyB0byB0aGUgYHdpbmRvd2AgdmFyaWFibGUuXG4vL1xuLy8gRXhhbXBsZXM6XG4vLyAgICAgJ01vZHVsZScuY29uc3RhbnRpemUgICAgICMgPT4gTW9kdWxlXG4vLyAgICAgJ1Rlc3QuVW5pdCcuY29uc3RhbnRpemUgICMgPT4gVGVzdC5Vbml0XG4vLyAgICAgJ1VuaXQnLmNvbnN0YW50aXplKFRlc3QpICMgPT4gVGVzdC5Vbml0XG4vL1xuLy8gVmlraW5nLk5hbWVFcnJvciBpcyByYWlzZWQgd2hlbiB0aGUgdmFyaWFibGUgaXMgdW5rbm93bi5cblN0cmluZy5wcm90b3R5cGUuY29uc3RhbnRpemUgPSBmdW5jdGlvbihjb250ZXh0KSB7XG4gICAgaWYoIWNvbnRleHQpIHsgY29udGV4dCA9IHdpbmRvdzsgfVxuXG4gICAgcmV0dXJuIHRoaXMuc3BsaXQoJy4nKS5yZWR1Y2UoZnVuY3Rpb24gKGNvbnRleHQsIG5hbWUpIHtcbiAgICAgICAgbGV0IHYgPSBjb250ZXh0W25hbWVdO1xuICAgICAgICBpZiAoIXYpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBWaWtpbmcuTmFtZUVycm9yKFwidW5pbml0aWFsaXplZCB2YXJpYWJsZSBcIiArIG5hbWUpOyBcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdjtcbiAgICB9LCBjb250ZXh0KTtcbn07XG5cbi8vIFJlbW92ZXMgdGhlIG1vZHVsZSBwYXJ0IGZyb20gdGhlIGV4cHJlc3Npb24gaW4gdGhlIHN0cmluZy5cbi8vXG4vLyBFeGFtcGxlczpcbi8vICAgICAnTmFtZXNwYWNlZC5Nb2R1bGUnLmRlbW9kdWxpemUoKSAjID0+ICdNb2R1bGUnXG4vLyAgICAgJ01vZHVsZScuZGVtb2R1bGl6ZSgpICMgPT4gJ01vZHVsZSdcbi8vICAgICAnJy5kZW1vZHVsaXplKCkgIyA9PiAnJ1xuU3RyaW5nLnByb3RvdHlwZS5kZW1vZHVsaXplID0gZnVuY3Rpb24gKHNlcGVyYXRvcikge1xuICAgIGlmICghc2VwZXJhdG9yKSB7XG4gICAgICAgIHNlcGVyYXRvciA9ICcuJztcbiAgICB9XG5cbiAgICBsZXQgaW5kZXggPSB0aGlzLmxhc3RJbmRleE9mKHNlcGVyYXRvcik7XG5cbiAgICBpZiAoaW5kZXggPT09IC0xKSB7XG4gICAgICAgIHJldHVybiBTdHJpbmcodGhpcyk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuc2xpY2UoaW5kZXggKyAxKTtcbiAgICB9XG59XG5cbi8vIElmIGBsZW5ndGhgIGlzIGdyZWF0ZXIgdGhhbiB0aGUgbGVuZ3RoIG9mIHRoZSBzdHJpbmcsIHJldHVybnMgYSBuZXcgU3RyaW5nXG4vLyBvZiBsZW5ndGggYGxlbmd0aGAgd2l0aCB0aGUgc3RyaW5nIHJpZ2h0IGp1c3RpZmllZCBhbmQgcGFkZGVkIHdpdGggcGFkU3RyaW5nO1xuLy8gb3RoZXJ3aXNlLCByZXR1cm5zIHN0cmluZ1xuU3RyaW5nLnByb3RvdHlwZS5yanVzdCA9IGZ1bmN0aW9uKGxlbmd0aCwgcGFkU3RyaW5nKSB7XG4gICAgaWYgKCFwYWRTdHJpbmcpIHsgcGFkU3RyaW5nID0gJyAnOyB9XG4gICAgXG4gICAgbGV0IHBhZGRpbmcgPSAnJztcbiAgICBsZXQgcGFkZGluZ0xlbmd0aCA9IGxlbmd0aCAtIHRoaXMubGVuZ3RoO1xuXG4gICAgd2hpbGUgKHBhZGRpbmcubGVuZ3RoIDwgcGFkZGluZ0xlbmd0aCkge1xuICAgICAgICBpZiAocGFkZGluZ0xlbmd0aCAtIHBhZGRpbmcubGVuZ3RoIDwgcGFkU3RyaW5nLmxlbmd0aCkge1xuICAgICAgICAgICAgcGFkZGluZyA9IHBhZGRpbmcgKyBwYWRTdHJpbmcuc2xpY2UoMCwgcGFkZGluZ0xlbmd0aCAtIHBhZGRpbmcubGVuZ3RoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHBhZGRpbmcgPSBwYWRkaW5nICsgcGFkU3RyaW5nO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHBhZGRpbmcgKyB0aGlzO1xufTtcblxuLy8gSWYgYGxlbmd0aGAgaXMgZ3JlYXRlciB0aGFuIHRoZSBsZW5ndGggb2YgdGhlIHN0cmluZywgcmV0dXJucyBhIG5ldyBTdHJpbmdcbi8vIG9mIGxlbmd0aCBgbGVuZ3RoYCB3aXRoIHRoZSBzdHJpbmcgbGVmdCBqdXN0aWZpZWQgYW5kIHBhZGRlZCB3aXRoIHBhZFN0cmluZztcbi8vIG90aGVyd2lzZSwgcmV0dXJucyBzdHJpbmdcblN0cmluZy5wcm90b3R5cGUubGp1c3QgPSBmdW5jdGlvbihsZW5ndGgsIHBhZFN0cmluZykge1xuICAgIGlmICghcGFkU3RyaW5nKSB7IHBhZFN0cmluZyA9ICcgJzsgfVxuICAgIFxuICAgIGxldCBwYWRkaW5nID0gJyc7XG4gICAgbGV0IHBhZGRpbmdMZW5ndGggPSBsZW5ndGggLSB0aGlzLmxlbmd0aDtcblxuICAgIHdoaWxlIChwYWRkaW5nLmxlbmd0aCA8IHBhZGRpbmdMZW5ndGgpIHtcbiAgICAgICAgaWYgKHBhZGRpbmdMZW5ndGggLSBwYWRkaW5nLmxlbmd0aCA8IHBhZFN0cmluZy5sZW5ndGgpIHtcbiAgICAgICAgICAgIHBhZGRpbmcgPSBwYWRkaW5nICsgcGFkU3RyaW5nLnNsaWNlKDAsIHBhZGRpbmdMZW5ndGggLSBwYWRkaW5nLmxlbmd0aCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBwYWRkaW5nID0gcGFkZGluZyArIHBhZFN0cmluZztcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiB0aGlzICsgcGFkZGluZztcbn07XG5cbi8vIEFsaWFzIG9mIHRvX3MuXG5TdHJpbmcucHJvdG90eXBlLnRvUGFyYW0gPSBTdHJpbmcucHJvdG90eXBlLnRvU3RyaW5nO1xuXG5TdHJpbmcucHJvdG90eXBlLnRvUXVlcnkgPSBmdW5jdGlvbihrZXkpIHtcblx0cmV0dXJuIGVzY2FwZShrZXkudG9QYXJhbSgpKSArIFwiPVwiICsgZXNjYXBlKHRoaXMudG9QYXJhbSgpKTtcbn07XG5cblN0cmluZy5wcm90b3R5cGUuZG93bmNhc2UgPSBTdHJpbmcucHJvdG90eXBlLnRvTG93ZXJDYXNlO1xuIiwiY29uc3QgTW9kZWwgPSB7IHRlc3Q6IDQyLCBhOiAoKSA9PiB7IHJldHVybiAzOyB9IH1cblxuZXhwb3J0IGRlZmF1bHQgTW9kZWw7XG5cbi8vXG4vLyAvLz0gcmVxdWlyZV9zZWxmXG4vLyAvLz0gcmVxdWlyZSAuL21vZGVsL25hbWVcbi8vIC8vPSByZXF1aXJlIC4vbW9kZWwvcmVmbGVjdGlvblxuLy8gLy89IHJlcXVpcmVfdHJlZSAuL21vZGVsL3JlZmxlY3Rpb25zXG4vLyAvLz0gcmVxdWlyZV90cmVlIC4vbW9kZWwvY2xhc3NfcHJvcGVydGllc1xuLy8gLy89IHJlcXVpcmVfdHJlZSAuL21vZGVsL2luc3RhbmNlX3Byb3BlcnRpZXNcbi8vIC8vPSByZXF1aXJlIC4vbW9kZWwvdHlwZVxuLy8gLy89IHJlcXVpcmVfdHJlZSAuL21vZGVsL3R5cGVzXG4vL1xuLy8gLy8gVmlraW5nLk1vZGVsXG4vLyAvLyAtLS0tLS0tLS0tLS1cbi8vIC8vXG4vLyAvLyBWaWtpbmcuTW9kZWwgaXMgYW4gZXh0ZW5zaW9uIG9mIFtCYWNrYm9uZS5Nb2RlbF0oaHR0cDovL2JhY2tib25lanMub3JnLyNNb2RlbCkuXG4vLyAvLyBJdCBhZGRzIG5hbWluZywgcmVsYXRpb25zaGlwcywgZGF0YSB0eXBlIGNvZXJjaW9ucywgc2VsZWN0aW9uLCBhbmQgbW9kaWZpZXNcbi8vIC8vIHN5bmMgdG8gd29yayB3aXRoIFtSdWJ5IG9uIFJhaWxzXShodHRwOi8vcnVieW9ucmFpbHMub3JnLykgb3V0IG9mIHRoZSBib3guXG4vLyBWaWtpbmcuTW9kZWwgPSBCYWNrYm9uZS5Nb2RlbC5leHRlbmQoe1xuLy9cbi8vICAgICBhYnN0cmFjdDogdHJ1ZSxcbi8vXG4vLyAgICAgLy8gaW5oZXJpdGFuY2VBdHRyaWJ1dGUgaXMgdGhlIGF0dGlyYnV0ZXMgdXNlZCBmb3IgU1RJXG4vLyAgICAgaW5oZXJpdGFuY2VBdHRyaWJ1dGU6ICd0eXBlJyxcbi8vXG4vLyAgICAgZGVmYXVsdHM6IGZ1bmN0aW9uICgpIHtcbi8vICAgICAgICAgbGV0IGRmbHRzID0ge307XG4vL1xuLy8gICAgICAgICBpZiAodHlwZW9mKHRoaXMuc2NoZW1hKSA9PT0gJ3VuZGVmaW5lZCcpIHtcbi8vICAgICAgICAgICAgIHJldHVybiBkZmx0cztcbi8vICAgICAgICAgfVxuLy9cbi8vICAgICAgICAgT2JqZWN0LmtleXModGhpcy5zY2hlbWEpLmZvckVhY2goIChrZXkpID0+IHtcbi8vICAgICAgICAgICAgIGlmICh0aGlzLnNjaGVtYVtrZXldWydkZWZhdWx0J10pIHtcbi8vICAgICAgICAgICAgICAgICBkZmx0c1trZXldID0gdGhpcy5zY2hlbWFba2V5XVsnZGVmYXVsdCddO1xuLy8gICAgICAgICAgICAgfVxuLy8gICAgICAgICB9KTtcbi8vXG4vLyAgICAgICAgIHJldHVybiBkZmx0cztcbi8vICAgICB9LFxuLy9cbi8vICAgICAvLyBCZWxvdyBpcyB0aGUgc2FtZSBjb2RlIGZyb20gdGhlIEJhY2tib25lLk1vZGVsIGZ1bmN0aW9uXG4vLyAgICAgLy8gZXhjZXB0IHdoZXJlIHRoZXJlIGFyZSBjb21tZW50c1xuLy8gICAgIGNvbnN0cnVjdG9yOiBmdW5jdGlvbiAoYXR0cmlidXRlcywgb3B0aW9ucykge1xuLy8gICAgICAgICBsZXQgYXR0cnMgPSBhdHRyaWJ1dGVzIHx8IHt9O1xuLy8gICAgICAgICBvcHRpb25zIHx8IChvcHRpb25zID0ge30pO1xuLy8gICAgICAgICB0aGlzLmNpZCA9IF8udW5pcXVlSWQoJ2MnKTtcbi8vICAgICAgICAgdGhpcy5hdHRyaWJ1dGVzID0ge307XG4vL1xuLy8gICAgICAgICBhdHRycyA9IF8uZGVmYXVsdHMoe30sIGF0dHJzLCBfLnJlc3VsdCh0aGlzLCAnZGVmYXVsdHMnKSk7XG4vL1xuLy8gICAgICAgICBpZiAodGhpcy5pbmhlcml0YW5jZUF0dHJpYnV0ZSkge1xuLy8gICAgICAgICAgICAgaWYgKGF0dHJzW3RoaXMuaW5oZXJpdGFuY2VBdHRyaWJ1dGVdICYmIHRoaXMuY29uc3RydWN0b3IubW9kZWxOYW1lLm5hbWUgIT09IGF0dHJzW3RoaXMuaW5oZXJpdGFuY2VBdHRyaWJ1dGVdKSB7XG4vLyAgICAgICAgICAgICAgICAgLy8gT1BUSU1JWkU6ICBNdXRhdGluZyB0aGUgW1tQcm90b3R5cGVdXSBvZiBhbiBvYmplY3QsIG5vIG1hdHRlciBob3dcbi8vICAgICAgICAgICAgICAgICAvLyB0aGlzIGlzIGFjY29tcGxpc2hlZCwgaXMgc3Ryb25nbHkgZGlzY291cmFnZWQsIGJlY2F1c2UgaXQgaXMgdmVyeVxuLy8gICAgICAgICAgICAgICAgIC8vIHNsb3cgYW5kIHVuYXZvaWRhYmx5IHNsb3dzIGRvd24gc3Vic2VxdWVudCBleGVjdXRpb24gaW4gbW9kZXJuXG4vLyAgICAgICAgICAgICAgICAgLy8gSmF2YVNjcmlwdCBpbXBsZW1lbnRhdGlvbnNcbi8vICAgICAgICAgICAgICAgICAvLyBJZGVhczogTW92ZSB0byBNb2RlbC5uZXcoLi4uKSBtZXRob2Qgb2YgaW5pdGlhbGl6aW5nIG1vZGVsc1xuLy8gICAgICAgICAgICAgICAgIGxldCB0eXBlID0gYXR0cnNbdGhpcy5pbmhlcml0YW5jZUF0dHJpYnV0ZV0uY2FtZWxpemUoKS5jb25zdGFudGl6ZSgpO1xuLy8gICAgICAgICAgICAgICAgIHRoaXMuY29uc3RydWN0b3IgPSB0eXBlO1xuLy8gICAgICAgICAgICAgICAgIHRoaXMuX19wcm90b19fID0gdHlwZS5wcm90b3R5cGU7XG4vLyAgICAgICAgICAgICB9XG4vLyAgICAgICAgIH1cbi8vXG4vLyAgICAgICAgIC8vIEFkZCBhIGhlbHBlciByZWZlcmVuY2UgdG8gZ2V0IHRoZSBtb2RlbCBuYW1lIGZyb20gYW4gbW9kZWwgaW5zdGFuY2UuXG4vLyAgICAgICAgIHRoaXMubW9kZWxOYW1lID0gdGhpcy5jb25zdHJ1Y3Rvci5tb2RlbE5hbWU7XG4vLyAgICAgICAgIHRoaXMuYmFzZU1vZGVsID0gdGhpcy5jb25zdHJ1Y3Rvci5iYXNlTW9kZWw7XG4vL1xuLy8gICAgICAgICBpZiAodGhpcy5iYXNlTW9kZWwgJiYgdGhpcy5tb2RlbE5hbWUgJiYgdGhpcy5pbmhlcml0YW5jZUF0dHJpYnV0ZSkge1xuLy8gICAgICAgICAgICAgaWYgKHRoaXMuYmFzZU1vZGVsID09PSB0aGlzLmNvbnN0cnVjdG9yICYmIHRoaXMuYmFzZU1vZGVsLmRlc2NlbmRhbnRzLmxlbmd0aCA+IDApIHtcbi8vICAgICAgICAgICAgICAgICBhdHRyc1t0aGlzLmluaGVyaXRhbmNlQXR0cmlidXRlXSA9IHRoaXMubW9kZWxOYW1lLm5hbWU7XG4vLyAgICAgICAgICAgICB9IGVsc2UgaWYgKF8uY29udGFpbnModGhpcy5iYXNlTW9kZWwuZGVzY2VuZGFudHMsIHRoaXMuY29uc3RydWN0b3IpKSB7XG4vLyAgICAgICAgICAgICAgICAgYXR0cnNbdGhpcy5pbmhlcml0YW5jZUF0dHJpYnV0ZV0gPSB0aGlzLm1vZGVsTmFtZS5uYW1lO1xuLy8gICAgICAgICAgICAgfVxuLy8gICAgICAgICB9XG4vL1xuLy8gICAgICAgICAvLyBTZXQgdXAgYXNzb2NpYXRpb25zXG4vLyAgICAgICAgIHRoaXMuYXNzb2NpYXRpb25zID0gdGhpcy5jb25zdHJ1Y3Rvci5hc3NvY2lhdGlvbnM7XG4vLyAgICAgICAgIHRoaXMucmVmbGVjdE9uQXNzb2NpYXRpb24gPSB0aGlzLmNvbnN0cnVjdG9yLnJlZmxlY3RPbkFzc29jaWF0aW9uO1xuLy8gICAgICAgICB0aGlzLnJlZmxlY3RPbkFzc29jaWF0aW9ucyA9IHRoaXMuY29uc3RydWN0b3IucmVmbGVjdE9uQXNzb2NpYXRpb25zO1xuLy9cbi8vICAgICAgICAgLy8gSW5pdGlhbGl6ZSBhbnkgYGhhc01hbnlgIHJlbGF0aW9uc2hpcHMgdG8gZW1wdHkgY29sbGVjdGlvbnNcbi8vICAgICAgICAgdGhpcy5yZWZsZWN0T25Bc3NvY2lhdGlvbnMoJ2hhc01hbnknKS5mb3JFYWNoKGZ1bmN0aW9uKGFzc29jaWF0aW9uKSB7XG4vLyAgICAgICAgICAgICB0aGlzLmF0dHJpYnV0ZXNbYXNzb2NpYXRpb24ubmFtZV0gPSBuZXcgKGFzc29jaWF0aW9uLmNvbGxlY3Rpb24oKSkoKTtcbi8vICAgICAgICAgfSwgdGhpcyk7XG4vL1xuLy8gICAgICAgICBpZiAob3B0aW9ucy5jb2xsZWN0aW9uKSB7IHRoaXMuY29sbGVjdGlvbiA9IG9wdGlvbnMuY29sbGVjdGlvbjsgfVxuLy8gICAgICAgICBpZiAob3B0aW9ucy5wYXJzZSkgeyBhdHRycyA9IHRoaXMucGFyc2UoYXR0cnMsIG9wdGlvbnMpIHx8IHt9OyB9XG4vL1xuLy8gICAgICAgICB0aGlzLnNldChhdHRycywgb3B0aW9ucyk7XG4vLyAgICAgICAgIHRoaXMuY2hhbmdlZCA9IHt9O1xuLy8gICAgICAgICB0aGlzLmluaXRpYWxpemUuY2FsbCh0aGlzLCBhdHRyaWJ1dGVzLCBvcHRpb25zKTtcbi8vICAgICB9XG4vL1xuLy8gfSwge1xuLy9cbi8vICAgICBhc3NvY2lhdGlvbnM6IFtdLFxuLy9cbi8vICAgICAvLyBPdmVyaWRlIHRoZSBkZWZhdWx0IGV4dGVuZCBtZXRob2QgdG8gc3VwcG9ydCBwYXNzaW5nIGluIHRoZSBtb2RlbE5hbWVcbi8vICAgICAvLyBhbmQgc3VwcG9ydCBTVElcbi8vICAgICAvL1xuLy8gICAgIC8vIFRoZSBtb2RlbE5hbWUgaXMgdXNlZCBmb3IgZ2VuZXJhdGluZyB1cmxzIGFuZCByZWxhdGlvbnNoaXBzLlxuLy8gICAgIC8vXG4vLyAgICAgLy8gSWYgYSBNb2RlbCBpcyBleHRlbmRlZCBmdXJ0aGVyIGlzIGFjdHMgc2ltbGFyIHRvIEFjdGl2ZVJlY29yZHMgU1RJLlxuLy8gICAgIC8vXG4vLyAgICAgLy8gYG5hbWVgIGlzIG9wdGlvbmFsLCBhbmQgbXVzdCBiZSBhIHN0cmluZ1xuLy8gICAgIGV4dGVuZDogZnVuY3Rpb24obmFtZSwgcHJvdG9Qcm9wcywgc3RhdGljUHJvcHMpIHtcbi8vICAgICAgICAgaWYodHlwZW9mIG5hbWUgIT09ICdzdHJpbmcnKSB7XG4vLyAgICAgICAgICAgICBzdGF0aWNQcm9wcyA9IHByb3RvUHJvcHM7XG4vLyAgICAgICAgICAgICBwcm90b1Byb3BzID0gbmFtZTtcbi8vICAgICAgICAgfVxuLy8gICAgICAgICBwcm90b1Byb3BzIHx8IChwcm90b1Byb3BzID0ge30pO1xuLy9cbi8vICAgICAgICAgbGV0IGNoaWxkID0gQmFja2JvbmUuTW9kZWwuZXh0ZW5kLmNhbGwodGhpcywgcHJvdG9Qcm9wcywgc3RhdGljUHJvcHMpO1xuLy9cbi8vICAgICAgICAgaWYodHlwZW9mIG5hbWUgPT09ICdzdHJpbmcnKSB7XG4vLyAgICAgICAgICAgICBjaGlsZC5tb2RlbE5hbWUgPSBuZXcgVmlraW5nLk1vZGVsLk5hbWUobmFtZSk7XG4vLyAgICAgICAgIH1cbi8vXG4vLyAgICAgICAgIGNoaWxkLmFzc29jaWF0aW9ucyA9IHt9O1xuLy8gICAgICAgICBjaGlsZC5kZXNjZW5kYW50cyA9IFtdO1xuLy8gICAgICAgICBjaGlsZC5pbmhlcml0YW5jZUF0dHJpYnV0ZSA9IChwcm90b1Byb3BzLmluaGVyaXRhbmNlQXR0cmlidXRlID09PSB1bmRlZmluZWQpID8gdGhpcy5wcm90b3R5cGUuaW5oZXJpdGFuY2VBdHRyaWJ1dGUgOiBwcm90b1Byb3BzLmluaGVyaXRhbmNlQXR0cmlidXRlO1xuLy9cbi8vICAgICAgICAgaWYgKGNoaWxkLmluaGVyaXRhbmNlQXR0cmlidXRlID09PSBmYWxzZSB8fCAodGhpcy5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkoJ2Fic3RyYWN0JykgJiYgdGhpcy5wcm90b3R5cGUuYWJzdHJhY3QpKSB7XG4vLyAgICAgICAgICAgICBjaGlsZC5iYXNlTW9kZWwgPSBjaGlsZDtcbi8vICAgICAgICAgfSBlbHNlIHtcbi8vICAgICAgICAgICAgIGNoaWxkLmJhc2VNb2RlbC5kZXNjZW5kYW50cy5wdXNoKGNoaWxkKTtcbi8vICAgICAgICAgfVxuLy9cbi8vICAgICAgICAgWydiZWxvbmdzVG8nLCAnaGFzT25lJywgJ2hhc01hbnknLCAnaGFzQW5kQmVsb25nc1RvTWFueSddLmZvckVhY2goZnVuY3Rpb24obWFjcm8pIHtcbi8vICAgICAgICAgICAgIChwcm90b1Byb3BzW21hY3JvXSB8fCBbXSkuY29uY2F0KHRoaXNbbWFjcm9dIHx8IFtdKS5mb3JFYWNoKGZ1bmN0aW9uKG5hbWUpIHtcbi8vICAgICAgICAgICAgICAgICBsZXQgb3B0aW9ucztcbi8vXG4vLyAgICAgICAgICAgICAgICAgLy8gSGFuZGxlIGJvdGggYHR5cGUsIGtleSwgb3B0aW9uc2AgYW5kIGB0eXBlLCBba2V5LCBvcHRpb25zXWAgc3R5bGUgYXJndW1lbnRzXG4vLyAgICAgICAgICAgICAgICAgaWYgKEFycmF5LmlzQXJyYXkobmFtZSkpIHtcbi8vICAgICAgICAgICAgICAgICAgICAgb3B0aW9ucyA9IG5hbWVbMV07XG4vLyAgICAgICAgICAgICAgICAgICAgIG5hbWUgPSBuYW1lWzBdO1xuLy8gICAgICAgICAgICAgICAgIH1cbi8vXG4vLyAgICAgICAgICAgICAgICAgaWYgKCFjaGlsZC5hc3NvY2lhdGlvbnNbbmFtZV0pIHtcbi8vICAgICAgICAgICAgICAgICAgICAgbGV0IHJlZmxlY3Rpb25DbGFzcyA9IHtcbi8vICAgICAgICAgICAgICAgICAgICAgICAgICdiZWxvbmdzVG8nOiBWaWtpbmcuTW9kZWwuQmVsb25nc1RvUmVmbGVjdGlvbixcbi8vICAgICAgICAgICAgICAgICAgICAgICAgICdoYXNPbmUnOiBWaWtpbmcuTW9kZWwuSGFzT25lUmVmbGVjdGlvbixcbi8vICAgICAgICAgICAgICAgICAgICAgICAgICdoYXNNYW55JzogVmlraW5nLk1vZGVsLkhhc01hbnlSZWZsZWN0aW9uLFxuLy8gICAgICAgICAgICAgICAgICAgICAgICAgJ2hhc0FuZEJlbG9uZ3NUb01hbnknOiBWaWtpbmcuTW9kZWwuSGFzQW5kQmVsb25nc1RvTWFueVJlZmxlY3Rpb25cbi8vICAgICAgICAgICAgICAgICAgICAgfVxuLy8gICAgICAgICAgICAgICAgICAgICByZWZsZWN0aW9uQ2xhc3MgPSByZWZsZWN0aW9uQ2xhc3NbbWFjcm9dO1xuLy9cbi8vICAgICAgICAgICAgICAgICAgICAgY2hpbGQuYXNzb2NpYXRpb25zW25hbWVdID0gbmV3IHJlZmxlY3Rpb25DbGFzcyhuYW1lLCBvcHRpb25zKTtcbi8vICAgICAgICAgICAgICAgICB9XG4vLyAgICAgICAgICAgICB9KTtcbi8vICAgICAgICAgfSwgdGhpcy5wcm90b3R5cGUpO1xuLy9cbi8vICAgICAgICAgaWYgKHRoaXMucHJvdG90eXBlLnNjaGVtYSAmJiBwcm90b1Byb3BzLnNjaGVtYSkge1xuLy8gICAgICAgICAgICAgT2JqZWN0LmtleXModGhpcy5wcm90b3R5cGUuc2NoZW1hKS5mb3JFYWNoKCAoa2V5KSA9PiB7XG4vLyAgICAgICAgICAgICAgICAgaWYoIWNoaWxkLnByb3RvdHlwZS5zY2hlbWFba2V5XSkge1xuLy8gICAgICAgICAgICAgICAgICAgICBjaGlsZC5wcm90b3R5cGUuc2NoZW1hW2tleV0gPSB0aGlzLnByb3RvdHlwZS5zY2hlbWFba2V5XTtcbi8vICAgICAgICAgICAgICAgICB9XG4vLyAgICAgICAgICAgICB9KTtcbi8vICAgICAgICAgfVxuLy9cbi8vICAgICAgICAgcmV0dXJuIGNoaWxkO1xuLy8gICAgIH1cbi8vXG4vLyB9KTtcbiIsIi8vIFZpa2luZy5qcyA8JT0gdmVyc2lvbiAlPiAoc2hhOjwlPSBnaXRfaW5mb1s6aGVhZF1bOnNoYV0gJT4pXG4vLyBcbi8vIChjKSAyMDEyLTwlPSBUaW1lLm5vdy55ZWFyICU+IEpvbmF0aGFuIEJyYWN5LCA0MkZsb29ycyBJbmMuXG4vLyBWaWtpbmcuanMgbWF5IGJlIGZyZWVseSBkaXN0cmlidXRlZCB1bmRlciB0aGUgTUlUIGxpY2Vuc2UuXG4vLyBodHRwOi8vdmlraW5nanMuY29tXG5cbmltcG9ydCAnLi92aWtpbmcvc3VwcG9ydCc7XG5pbXBvcnQgTW9kZWwgZnJvbSAnLi92aWtpbmcvbW9kZWwnO1xuXG5jb25zdCBWaWtpbmcgPSB7XG4gICAgTW9kZWw6IE1vZGVsLFxufTtcblxuZXhwb3J0IGRlZmF1bHQgVmlraW5nO1xuIl0sIm5hbWVzIjpbIlZpa2luZyJdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFFQSxDQUFBLE9BQU8sY0FBUCxDQUFzQixNQUFNLFNBQTVCLEVBQXVDLFNBQXZDLEVBQWtEO0FBQzlDLENBQUEsV0FBTyxpQkFBWTtBQUFFLENBQUEsZUFBTyxLQUFLLEdBQUwsQ0FBUyxVQUFDLENBQUQ7QUFBQSxDQUFBLG1CQUFPLEVBQUUsT0FBRixFQUFQO0FBQUEsQ0FBQSxTQUFULEVBQTZCLElBQTdCLENBQWtDLEdBQWxDLENBQVA7QUFBZ0QsQ0FBQSxLQUR2QjtBQUU5QyxDQUFBLGNBQVUsSUFGb0M7QUFHOUMsQ0FBQSxtQkFBZSxJQUgrQjtBQUk5QyxDQUFBLGdCQUFZO0FBSmtDLENBQUEsQ0FBbEQ7Ozs7QUFTQSxDQUFBLE9BQU8sY0FBUCxDQUFzQixNQUFNLFNBQTVCLEVBQXVDLFNBQXZDLEVBQWtEO0FBQzlDLENBQUEsV0FBTyxlQUFVLEdBQVYsRUFBZTtBQUNsQixDQUFBLFlBQUksU0FBUyxNQUFNLElBQW5CO0FBQ0EsQ0FBQSxlQUFPLEtBQUssR0FBTCxDQUFTLFVBQVUsS0FBVixFQUFpQjtBQUM3QixDQUFBLGdCQUFJLFVBQVUsSUFBZCxFQUFvQjtBQUNoQixDQUFBLHVCQUFPLE9BQU8sTUFBUCxJQUFpQixHQUF4QjtBQUNILENBQUE7QUFDRCxDQUFBLG1CQUFPLE1BQU0sT0FBTixDQUFjLE1BQWQsQ0FBUDtBQUNILENBQUEsU0FMTSxFQUtKLElBTEksQ0FLQyxHQUxELENBQVA7QUFNSCxDQUFBLEtBVDZDO0FBVTlDLENBQUEsY0FBVSxJQVZvQztBQVc5QyxDQUFBLG1CQUFlLElBWCtCO0FBWTlDLENBQUEsZ0JBQVk7QUFaa0MsQ0FBQSxDQUFsRDs7O0FDVkEsQ0FBQSxRQUFRLFNBQVIsQ0FBa0IsT0FBbEIsR0FBNEIsUUFBUSxTQUFSLENBQWtCLFFBQTlDOztBQUVBLENBQUEsUUFBUSxTQUFSLENBQWtCLE9BQWxCLEdBQTRCLFVBQVMsR0FBVCxFQUFjO0FBQ3pDLENBQUEsUUFBTyxPQUFPLElBQUksT0FBSixFQUFQLElBQXdCLEdBQXhCLEdBQThCLE9BQU8sS0FBSyxPQUFMLEVBQVAsQ0FBckM7QUFDQSxDQUFBLENBRkQ7Ozs7QUNEQSxDQUFBLEtBQUssU0FBTCxDQUFlLFFBQWYsR0FBMEIsVUFBUyxHQUFULEVBQWM7QUFDcEMsQ0FBQSxXQUFPLFNBQVMsR0FBVCxFQUFjLElBQWQsQ0FBUDtBQUNILENBQUEsQ0FGRDs7QUFJQSxDQUFBLEtBQUssT0FBTCxHQUFlLFVBQUMsQ0FBRDtBQUFBLENBQUEsV0FBTyxJQUFJLElBQUosQ0FBUyxDQUFULENBQVA7QUFBQSxDQUFBLENBQWY7OztBQUdBLENBQUEsS0FBSyxTQUFMLENBQWUsT0FBZixHQUF5QixLQUFLLFNBQUwsQ0FBZSxNQUF4Qzs7QUFFQSxDQUFBLEtBQUssU0FBTCxDQUFlLE9BQWYsR0FBeUIsVUFBUyxHQUFULEVBQWM7QUFDbkMsQ0FBQSxXQUFPLE9BQU8sSUFBSSxPQUFKLEVBQVAsSUFBd0IsR0FBeEIsR0FBOEIsT0FBTyxLQUFLLE9BQUwsRUFBUCxDQUFyQztBQUNILENBQUEsQ0FGRDs7QUFJQSxDQUFBLEtBQUssU0FBTCxDQUFlLEtBQWYsR0FBdUI7QUFBQSxDQUFBLFdBQU0sSUFBSSxJQUFKLEVBQU47QUFBQSxDQUFBLENBQXZCOztBQUVBLENBQUEsS0FBSyxTQUFMLENBQWUsT0FBZixHQUF5QixZQUFXO0FBQ2hDLENBQUEsV0FBUSxLQUFLLGNBQUwsT0FBMkIsSUFBSSxJQUFKLEVBQUQsQ0FBYSxjQUFiLEVBQTFCLElBQTJELEtBQUssV0FBTCxPQUF3QixJQUFJLElBQUosRUFBRCxDQUFhLFdBQWIsRUFBbEYsSUFBZ0gsS0FBSyxVQUFMLE9BQXVCLElBQUksSUFBSixFQUFELENBQWEsVUFBYixFQUE5STtBQUNILENBQUEsQ0FGRDs7QUFJQSxDQUFBLEtBQUssU0FBTCxDQUFlLFdBQWYsR0FBNkIsWUFBWTtBQUNyQyxDQUFBLFdBQVEsS0FBSyxjQUFMLE9BQTJCLElBQUksSUFBSixFQUFELENBQWEsY0FBYixFQUExQixJQUEyRCxLQUFLLFdBQUwsT0FBd0IsSUFBSSxJQUFKLEVBQUQsQ0FBYSxXQUFiLEVBQTFGO0FBQ0gsQ0FBQSxDQUZEOztBQUlBLENBQUEsS0FBSyxTQUFMLENBQWUsVUFBZixHQUE0QixZQUFXO0FBQ25DLENBQUEsV0FBUSxLQUFLLGNBQUwsT0FBMkIsSUFBSSxJQUFKLEVBQUQsQ0FBYSxjQUFiLEVBQWxDO0FBQ0gsQ0FBQSxDQUZEOztBQUtBLENBQUEsS0FBSyxTQUFMLENBQWUsSUFBZixHQUFzQixZQUFZO0FBQzlCLENBQUEsV0FBUSxPQUFRLElBQUksSUFBSixFQUFoQjtBQUNILENBQUEsQ0FGRDs7Ozs7Ozs7O0FDdkJBLENBQUEsT0FBTyxTQUFQLENBQWlCLFVBQWpCLEdBQThCLFlBQVc7QUFDckMsQ0FBQSxRQUFJLE1BQU0sS0FBSyxHQUFMLENBQVMsSUFBVCxDQUFWOztBQUVBLENBQUEsUUFBSSxNQUFNLEdBQU4sSUFBYSxFQUFiLElBQW1CLE1BQU0sR0FBTixJQUFhLEVBQXBDLEVBQXdDO0FBQ3BDLENBQUEsZUFBTyxPQUFPLElBQWQ7QUFDSCxDQUFBOztBQUVELENBQUEsVUFBTSxNQUFNLEVBQVo7QUFDQSxDQUFBLFFBQUksUUFBUSxDQUFaLEVBQWU7QUFBRSxDQUFBLGVBQU8sT0FBTyxJQUFkO0FBQXFCLENBQUE7QUFDdEMsQ0FBQSxRQUFJLFFBQVEsQ0FBWixFQUFlO0FBQUUsQ0FBQSxlQUFPLE9BQU8sSUFBZDtBQUFxQixDQUFBO0FBQ3RDLENBQUEsUUFBSSxRQUFRLENBQVosRUFBZTtBQUFFLENBQUEsZUFBTyxPQUFPLElBQWQ7QUFBcUIsQ0FBQTs7QUFFdEMsQ0FBQSxXQUFPLE9BQU8sSUFBZDtBQUNILENBQUEsQ0FiRDs7O0FBZ0JBLENBQUEsT0FBTyxTQUFQLENBQWlCLE9BQWpCLEdBQTJCLE9BQU8sU0FBUCxDQUFpQixRQUE1Qzs7QUFFQSxDQUFBLE9BQU8sU0FBUCxDQUFpQixPQUFqQixHQUEyQixVQUFTLEdBQVQsRUFBYztBQUNyQyxDQUFBLFdBQU8sT0FBTyxJQUFJLE9BQUosRUFBUCxJQUF3QixHQUF4QixHQUE4QixPQUFPLEtBQUssT0FBTCxFQUFQLENBQXJDO0FBQ0gsQ0FBQSxDQUZEOztBQUlBLENBQUEsT0FBTyxTQUFQLENBQWlCLE1BQWpCLEdBQTBCLFlBQVc7QUFDakMsQ0FBQSxXQUFPLE9BQU8sSUFBZDtBQUNILENBQUEsQ0FGRDs7QUFJQSxDQUFBLE9BQU8sU0FBUCxDQUFpQixPQUFqQixHQUEyQixPQUFPLFNBQVAsQ0FBaUIsTUFBNUM7O0FBRUEsQ0FBQSxPQUFPLFNBQVAsQ0FBaUIsTUFBakIsR0FBMEIsWUFBVztBQUNqQyxDQUFBLFdBQU8sT0FBTyxLQUFkO0FBQ0gsQ0FBQSxDQUZEOztBQUlBLENBQUEsT0FBTyxTQUFQLENBQWlCLE9BQWpCLEdBQTJCLE9BQU8sU0FBUCxDQUFpQixNQUE1Qzs7QUFFQSxDQUFBLE9BQU8sU0FBUCxDQUFpQixJQUFqQixHQUF3QixZQUFXO0FBQy9CLENBQUEsV0FBTyxPQUFPLE9BQWQ7QUFDSCxDQUFBLENBRkQ7O0FBSUEsQ0FBQSxPQUFPLFNBQVAsQ0FBaUIsS0FBakIsR0FBeUIsT0FBTyxTQUFQLENBQWlCLElBQTFDOztBQUVBLENBQUEsT0FBTyxTQUFQLENBQWlCLEdBQWpCLEdBQXVCLFlBQVc7QUFDOUIsQ0FBQSxXQUFPLE9BQU8sUUFBZDtBQUNILENBQUEsQ0FGRDs7QUFJQSxDQUFBLE9BQU8sU0FBUCxDQUFpQixJQUFqQixHQUF3QixPQUFPLFNBQVAsQ0FBaUIsR0FBekM7O0FBRUEsQ0FBQSxPQUFPLFNBQVAsQ0FBaUIsSUFBakIsR0FBd0IsWUFBVztBQUMvQixDQUFBLFdBQU8sT0FBTyxDQUFQLEdBQVcsUUFBbEI7QUFDSCxDQUFBLENBRkQ7O0FBSUEsQ0FBQSxPQUFPLFNBQVAsQ0FBaUIsS0FBakIsR0FBeUIsT0FBTyxTQUFQLENBQWlCLElBQTFDOztBQUVBLENBQUEsT0FBTyxTQUFQLENBQWlCLEdBQWpCLEdBQXVCLFlBQVc7QUFDOUIsQ0FBQSxXQUFPLElBQUksSUFBSixDQUFVLElBQUksSUFBSixFQUFELENBQWEsT0FBYixLQUF5QixJQUFsQyxDQUFQO0FBQ0gsQ0FBQSxDQUZEOztBQUlBLENBQUEsT0FBTyxTQUFQLENBQWlCLE9BQWpCLEdBQTJCLFlBQVc7QUFDbEMsQ0FBQSxXQUFPLElBQUksSUFBSixDQUFVLElBQUksSUFBSixFQUFELENBQWEsT0FBYixLQUF5QixJQUFsQyxDQUFQO0FBQ0gsQ0FBQSxDQUZEOzs7Ozs7Ozs7Ozs7OztBQ25EQSxDQUFBLE9BQU8sY0FBUCxDQUFzQixPQUFPLFNBQTdCLEVBQXdDLFNBQXhDLEVBQW1EO0FBQy9DLENBQUEsY0FBVSxJQURxQztBQUUvQyxDQUFBLG1CQUFlLElBRmdDO0FBRy9DLENBQUEsZ0JBQVksS0FIbUM7QUFJL0MsQ0FBQSxXQUFPLGVBQVMsU0FBVCxFQUFvQjtBQUFBLENBQUE7O0FBQ3ZCLENBQUEsZUFBTyxPQUFPLElBQVAsQ0FBWSxJQUFaLEVBQWtCLEdBQWxCLENBQXNCLFVBQUMsR0FBRCxFQUFTO0FBQ2xDLENBQUEsZ0JBQUksUUFBUSxNQUFLLEdBQUwsQ0FBWjtBQUNBLENBQUEsZ0JBQUksbUJBQW9CLFlBQWEsWUFBWSxHQUFaLEdBQWtCLEdBQWxCLEdBQXdCLEdBQXJDLEdBQTRDLEdBQXBFOztBQUVBLENBQUEsZ0JBQUksVUFBVSxJQUFWLElBQWtCLFVBQVUsU0FBaEMsRUFBMkM7QUFDdkMsQ0FBQSx1QkFBTyxPQUFPLGdCQUFQLENBQVA7QUFDSCxDQUFBLGFBRkQsTUFFTztBQUNILENBQUEsdUJBQU8sTUFBTSxPQUFOLENBQWMsZ0JBQWQsQ0FBUDtBQUNILENBQUE7QUFDSixDQUFBLFNBVE0sRUFTSixJQVRJLENBU0MsR0FURCxDQUFQO0FBVUgsQ0FBQTtBQWY4QyxDQUFBLENBQW5EOzs7Ozs7O0FBdUJBLENBQUEsT0FBTyxjQUFQLENBQXNCLE9BQU8sU0FBN0IsRUFBd0MsU0FBeEMsRUFBbUQ7QUFDL0MsQ0FBQSxjQUFVLElBRHFDO0FBRS9DLENBQUEsbUJBQWUsSUFGZ0M7QUFHL0MsQ0FBQSxnQkFBWSxLQUhtQztBQUkvQyxDQUFBLFdBQU8sT0FBTyxTQUFQLENBQWlCO0FBSnVCLENBQUEsQ0FBbkQ7OztBQ2xDQSxDQUFBLE9BQU8sU0FBUCxDQUFpQixVQUFqQixHQUE4QixZQUFXO0FBQ3JDLENBQUEsV0FBTyxLQUFLLE1BQUwsQ0FBWSxDQUFaLEVBQWUsV0FBZixLQUErQixLQUFLLEtBQUwsQ0FBVyxDQUFYLENBQXRDO0FBQ0gsQ0FBQSxDQUZEOzs7QUFLQSxDQUFBLE9BQU8sU0FBUCxDQUFpQixjQUFqQixHQUFrQyxZQUFXO0FBQ3pDLENBQUEsV0FBTyxLQUFLLE1BQUwsQ0FBWSxDQUFaLEVBQWUsV0FBZixLQUErQixLQUFLLEtBQUwsQ0FBVyxDQUFYLENBQXRDO0FBQ0gsQ0FBQSxDQUZEOzs7O0FBTUEsQ0FBQSxPQUFPLFNBQVAsQ0FBaUIsUUFBakIsR0FBNEIsWUFBVztBQUNuQyxDQUFBLFdBQU8sS0FBSyxVQUFMLEdBQWtCLFFBQWxCLEdBQTZCLE9BQTdCLENBQXFDLGNBQXJDLEVBQXFELFVBQVMsQ0FBVCxFQUFXO0FBQUUsQ0FBQSxlQUFPLEVBQUUsV0FBRixFQUFQO0FBQXlCLENBQUEsS0FBM0YsQ0FBUDtBQUNILENBQUEsQ0FGRDs7OztBQU1BLENBQUEsT0FBTyxTQUFQLENBQWlCLFFBQWpCLEdBQTRCLFlBQVc7QUFDbkMsQ0FBQSxRQUFJLFNBQVMsS0FBSyxXQUFMLEdBQW1CLE9BQW5CLENBQTJCLE1BQTNCLEVBQW1DLEVBQW5DLEVBQXVDLE9BQXZDLENBQStDLElBQS9DLEVBQXFELEdBQXJELENBQWI7QUFDQSxDQUFBLGFBQVMsT0FBTyxPQUFQLENBQWUsYUFBZixFQUE4QixVQUFTLENBQVQsRUFBWTtBQUFFLENBQUEsZUFBTyxFQUFFLFdBQUYsRUFBUDtBQUF5QixDQUFBLEtBQXJFLENBQVQ7QUFDQSxDQUFBLFdBQU8sT0FBTyxVQUFQLEVBQVA7QUFDSCxDQUFBLENBSkQ7Ozs7Ozs7Ozs7Ozs7OztBQW1CQSxDQUFBLE9BQU8sU0FBUCxDQUFpQixVQUFqQixHQUE4QixZQUFXO0FBQ3JDLENBQUEsUUFBSSxTQUFTLEtBQUssT0FBTCxDQUFhLEdBQWIsRUFBa0IsR0FBbEIsQ0FBYjtBQUNBLENBQUEsYUFBUyxPQUFPLE9BQVAsQ0FBZSx5QkFBZixFQUEwQyxPQUExQyxDQUFUO0FBQ0EsQ0FBQSxhQUFTLE9BQU8sT0FBUCxDQUFlLG1CQUFmLEVBQW9DLE9BQXBDLENBQVQ7QUFDQSxDQUFBLFdBQU8sT0FBTyxPQUFQLENBQWUsR0FBZixFQUFvQixHQUFwQixFQUF5QixXQUF6QixFQUFQO0FBQ0gsQ0FBQSxDQUxEOzs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQXlCQSxDQUFBLE9BQU8sU0FBUCxDQUFpQixRQUFqQixHQUE0QixVQUFTLHNCQUFULEVBQWlDO0FBQ3pELENBQUEsUUFBSSxlQUFKOztBQUVBLENBQUEsUUFBSSwyQkFBMkIsU0FBM0IsSUFBd0Msc0JBQTVDLEVBQW9FO0FBQ2hFLENBQUEsaUJBQVMsS0FBSyxVQUFMLEVBQVQ7QUFDSCxDQUFBLEtBRkQsTUFFTztBQUNILENBQUEsaUJBQVMsS0FBSyxjQUFMLEVBQVQ7QUFDSCxDQUFBOztBQUVELENBQUEsYUFBUyxPQUFPLE9BQVAsQ0FBZSxxQkFBZixFQUFzQyxVQUFTLEVBQVQsRUFBYSxFQUFiLEVBQWlCLEtBQWpCLEVBQXdCLElBQXhCLEVBQThCO0FBQ3pFLENBQUEsZUFBTyxDQUFDLFNBQVMsRUFBVixJQUFnQixLQUFLLFVBQUwsRUFBdkI7QUFDSCxDQUFBLEtBRlEsQ0FBVDs7QUFJQSxDQUFBLFdBQU8sT0FBTyxPQUFQLENBQWUsR0FBZixFQUFvQixHQUFwQixDQUFQO0FBQ0gsQ0FBQSxDQWREOzs7Ozs7Ozs7OztBQXlCQSxDQUFBLE9BQU8sU0FBUCxDQUFpQixVQUFqQixHQUE4QixVQUFTLFNBQVQsRUFBb0I7QUFDOUMsQ0FBQSxRQUFHLEtBQUssUUFBTCxPQUFvQixNQUF2QixFQUErQjtBQUFFLENBQUEsZUFBTyxJQUFQO0FBQWMsQ0FBQTtBQUMvQyxDQUFBLFFBQUksS0FBSyxRQUFMLE9BQW9CLE9BQXhCLEVBQWlDO0FBQUUsQ0FBQSxlQUFPLEtBQVA7QUFBZSxDQUFBOztBQUVsRCxDQUFBLFdBQVEsY0FBYyxTQUFkLEdBQTBCLEtBQTFCLEdBQWtDLFNBQTFDO0FBQ0gsQ0FBQSxDQUxEOzs7Ozs7O0FBWUEsQ0FBQSxPQUFPLFNBQVAsQ0FBaUIsU0FBakIsR0FBNkIsWUFBVztBQUNwQyxDQUFBLFdBQU8sS0FBSyxPQUFMLENBQWEsR0FBYixFQUFrQixHQUFsQixDQUFQO0FBQ0gsQ0FBQSxDQUZEOzs7Ozs7OztBQVVBLENBQUEsT0FBTyxTQUFQLENBQWlCLFlBQWpCLEdBQWdDLFVBQVMsU0FBVCxFQUFvQjtBQUNoRCxDQUFBLFdBQU8sS0FBSyxXQUFMLEdBQW1CLE9BQW5CLENBQTJCLGdCQUEzQixFQUE2QyxhQUFhLEdBQTFELENBQVA7QUFDSCxDQUFBLENBRkQ7OztBQUtBLENBQUEsT0FBTyxTQUFQLENBQWlCLFNBQWpCLEdBQTZCLFVBQVMsS0FBVCxFQUFnQixhQUFoQixFQUErQjtBQUN4RCxDQUFBLFdBQU8sRUFBRSxTQUFGLENBQVksSUFBWixFQUFrQixLQUFsQixFQUF5QixhQUF6QixDQUFQO0FBQ0gsQ0FBQSxDQUZEOzs7QUFLQSxDQUFBLE9BQU8sU0FBUCxDQUFpQixXQUFqQixHQUErQixZQUFXO0FBQ3RDLENBQUEsV0FBTyxFQUFFLFdBQUYsQ0FBYyxJQUFkLENBQVA7QUFDSCxDQUFBLENBRkQ7Ozs7Ozs7Ozs7O0FBYUEsQ0FBQSxPQUFPLFNBQVAsQ0FBaUIsV0FBakIsR0FBK0IsVUFBUyxPQUFULEVBQWtCO0FBQzdDLENBQUEsUUFBRyxDQUFDLE9BQUosRUFBYTtBQUFFLENBQUEsa0JBQVUsTUFBVjtBQUFtQixDQUFBOztBQUVsQyxDQUFBLFdBQU8sS0FBSyxLQUFMLENBQVcsR0FBWCxFQUFnQixNQUFoQixDQUF1QixVQUFVLE9BQVYsRUFBbUIsSUFBbkIsRUFBeUI7QUFDbkQsQ0FBQSxZQUFJLElBQUksUUFBUSxJQUFSLENBQVI7QUFDQSxDQUFBLFlBQUksQ0FBQyxDQUFMLEVBQVE7QUFDSixDQUFBLGtCQUFNLElBQUksT0FBTyxTQUFYLENBQXFCLDRCQUE0QixJQUFqRCxDQUFOO0FBQ0gsQ0FBQTtBQUNELENBQUEsZUFBTyxDQUFQO0FBQ0gsQ0FBQSxLQU5NLEVBTUosT0FOSSxDQUFQO0FBT0gsQ0FBQSxDQVZEOzs7Ozs7OztBQWtCQSxDQUFBLE9BQU8sU0FBUCxDQUFpQixVQUFqQixHQUE4QixVQUFVLFNBQVYsRUFBcUI7QUFDL0MsQ0FBQSxRQUFJLENBQUMsU0FBTCxFQUFnQjtBQUNaLENBQUEsb0JBQVksR0FBWjtBQUNILENBQUE7O0FBRUQsQ0FBQSxRQUFJLFFBQVEsS0FBSyxXQUFMLENBQWlCLFNBQWpCLENBQVo7O0FBRUEsQ0FBQSxRQUFJLFVBQVUsQ0FBQyxDQUFmLEVBQWtCO0FBQ2QsQ0FBQSxlQUFPLE9BQU8sSUFBUCxDQUFQO0FBQ0gsQ0FBQSxLQUZELE1BRU87QUFDSCxDQUFBLGVBQU8sS0FBSyxLQUFMLENBQVcsUUFBUSxDQUFuQixDQUFQO0FBQ0gsQ0FBQTtBQUNKLENBQUEsQ0FaRDs7Ozs7QUFpQkEsQ0FBQSxPQUFPLFNBQVAsQ0FBaUIsS0FBakIsR0FBeUIsVUFBUyxNQUFULEVBQWlCLFNBQWpCLEVBQTRCO0FBQ2pELENBQUEsUUFBSSxDQUFDLFNBQUwsRUFBZ0I7QUFBRSxDQUFBLG9CQUFZLEdBQVo7QUFBa0IsQ0FBQTs7QUFFcEMsQ0FBQSxRQUFJLFVBQVUsRUFBZDtBQUNBLENBQUEsUUFBSSxnQkFBZ0IsU0FBUyxLQUFLLE1BQWxDOztBQUVBLENBQUEsV0FBTyxRQUFRLE1BQVIsR0FBaUIsYUFBeEIsRUFBdUM7QUFDbkMsQ0FBQSxZQUFJLGdCQUFnQixRQUFRLE1BQXhCLEdBQWlDLFVBQVUsTUFBL0MsRUFBdUQ7QUFDbkQsQ0FBQSxzQkFBVSxVQUFVLFVBQVUsS0FBVixDQUFnQixDQUFoQixFQUFtQixnQkFBZ0IsUUFBUSxNQUEzQyxDQUFwQjtBQUNILENBQUEsU0FGRCxNQUVPO0FBQ0gsQ0FBQSxzQkFBVSxVQUFVLFNBQXBCO0FBQ0gsQ0FBQTtBQUNKLENBQUE7O0FBRUQsQ0FBQSxXQUFPLFVBQVUsSUFBakI7QUFDSCxDQUFBLENBZkQ7Ozs7O0FBb0JBLENBQUEsT0FBTyxTQUFQLENBQWlCLEtBQWpCLEdBQXlCLFVBQVMsTUFBVCxFQUFpQixTQUFqQixFQUE0QjtBQUNqRCxDQUFBLFFBQUksQ0FBQyxTQUFMLEVBQWdCO0FBQUUsQ0FBQSxvQkFBWSxHQUFaO0FBQWtCLENBQUE7O0FBRXBDLENBQUEsUUFBSSxVQUFVLEVBQWQ7QUFDQSxDQUFBLFFBQUksZ0JBQWdCLFNBQVMsS0FBSyxNQUFsQzs7QUFFQSxDQUFBLFdBQU8sUUFBUSxNQUFSLEdBQWlCLGFBQXhCLEVBQXVDO0FBQ25DLENBQUEsWUFBSSxnQkFBZ0IsUUFBUSxNQUF4QixHQUFpQyxVQUFVLE1BQS9DLEVBQXVEO0FBQ25ELENBQUEsc0JBQVUsVUFBVSxVQUFVLEtBQVYsQ0FBZ0IsQ0FBaEIsRUFBbUIsZ0JBQWdCLFFBQVEsTUFBM0MsQ0FBcEI7QUFDSCxDQUFBLFNBRkQsTUFFTztBQUNILENBQUEsc0JBQVUsVUFBVSxTQUFwQjtBQUNILENBQUE7QUFDSixDQUFBOztBQUVELENBQUEsV0FBTyxPQUFPLE9BQWQ7QUFDSCxDQUFBLENBZkQ7OztBQWtCQSxDQUFBLE9BQU8sU0FBUCxDQUFpQixPQUFqQixHQUEyQixPQUFPLFNBQVAsQ0FBaUIsUUFBNUM7O0FBRUEsQ0FBQSxPQUFPLFNBQVAsQ0FBaUIsT0FBakIsR0FBMkIsVUFBUyxHQUFULEVBQWM7QUFDeEMsQ0FBQSxXQUFPLE9BQU8sSUFBSSxPQUFKLEVBQVAsSUFBd0IsR0FBeEIsR0FBOEIsT0FBTyxLQUFLLE9BQUwsRUFBUCxDQUFyQztBQUNBLENBQUEsQ0FGRDs7QUFJQSxDQUFBLE9BQU8sU0FBUCxDQUFpQixRQUFqQixHQUE0QixPQUFPLFNBQVAsQ0FBaUIsV0FBN0M7O0NDbk5BLElBQU0sUUFBUSxFQUFFLE1BQU0sRUFBUixFQUFZLEdBQUcsYUFBTTtBQUFFLENBQUEsV0FBTyxDQUFQO0FBQVcsQ0FBQSxHQUFsQyxFQUFkLENBRUE7O0NDT0EsSUFBTUEsV0FBUztBQUNYLENBQUEsV0FBTztBQURJLENBQUEsQ0FBZixDQUlBLEFBQWUsQUFBZjs7OzsifQ==