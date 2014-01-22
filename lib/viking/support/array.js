// Calls `to_param` on all its elements and joins the result with slashes.
// This is used by url_for in Viking Pack.
Array.prototype.toParam = function() {
	return _.map(this, function(e) { return e.toParam(); }).join('/');
}

// Converts an array into a string suitable for use as a URL query string,
// using the given key as the param name.
Array.prototype.toQuery = function(key) {
	var prefix = key + "[]";
	return _.map(this, function(value) { return value === null ? escape(prefix) + '=' : value.toQuery(prefix) }).join('&');
}
