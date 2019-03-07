// Alias of to_s.
Boolean.prototype.toParam = Boolean.prototype.toString;

Boolean.prototype.toQuery = function(key) {
	return encodeURIComponent(key.toParam()) + "=" + encodeURIComponent(this.toParam());
};
