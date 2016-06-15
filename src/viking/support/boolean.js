// Alias of to_s.
Boolean.prototype.toParam = Boolean.prototype.toString;

Boolean.prototype.toQuery = function(key) {
    return escape(key.toParam()) + "=" + escape(this.toParam());
};