// Helper method to configure defatuls on Viking Object.
//
// For example. Viking.Cursor defaults `per_page` to 25, to change this you
// can do either of the following:
//
// Viking.configure(Viking.Cursor, {per_page: 40}); // per_page is 40 by defatult
//
// Viking.configure(Viking.Cursor, 'per_page', 5); // per_page is 5 by defatult
Viking.config = function(obj, key, val) {
    var attrs;
    
    // Handle both `"key", value` and `{key: value}` -style arguments.
    if (typeof key === 'object') {
      attrs = key;
    } else {
      (attrs = {})[key] = val;
    }
    
    return _.extend(obj.prototype.defaults, attrs);
};