// Returns a string representing the object’s key suitable for use in URLs,
// or nil if `#isNew` is true.
Viking.Model.prototype.toParam = function() {
    return this.isNew() ? null : this.get('id');
};