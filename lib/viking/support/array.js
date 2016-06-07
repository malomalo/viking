// Calls `to_param` on all its elements and joins the result with slashes.
// This is used by url_for in Viking Pack.
Object.defineProperty(Array.prototype, 'toParam', {
    value: function () { return this.map((e) => e.toParam()).join('/'); },
    writable: true,
    configureable: true,
    enumerable: false
});

// Converts an array into a string suitable for use as a URL query string,
// using the given key as the param name.
Object.defineProperty(Array.prototype, 'toQuery', {
    value: function (key) {
        let prefix = key + "[]";
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
