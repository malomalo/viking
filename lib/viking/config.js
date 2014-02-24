// Viking.config
// -------------
//
// Helper method to configure defatults on an Viking Object.
//
// Example:
//
//     Viking.configure(Viking.Cursor, {per_page: 40});
//     Viking.configure(Viking.Cursor, 'per_page', 5); // per_page is 5 by defatult
Viking.config = function (obj, key, val) {
    var attrs;
    
    if (typeof key === 'object') {
        attrs = key;
    } else {
        (attrs = {})[key] = val;
    }
    
    return _.extend(obj.prototype.defaults, attrs);
};