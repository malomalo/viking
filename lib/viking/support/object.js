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
// The string pairs “key=value” that conform the query string are sorted
// lexicographically in ascending order.
Object.defineProperty(Object.prototype, 'toParam', {
	value: function(namespace) {
		return _.map(this, function(value, key) {
			var namespaceWithKey = (namespace ? (namespace + "[" + key + "]") : key);
		
			if (value !== null) {
				return value.toQuery(namespaceWithKey);
			}
            
			return escape(namespaceWithKey) + "=";
		
		}).join('&');
	},
	writable: true,
	configureable: true,
	enumerable: false
});

// Converts an object into a string suitable for use as a URL query string,
// using the given key as the param name.
//
// Note: This method is defined as a default implementation for all Objects for
// Object#toQuery to work.
Object.defineProperty(Object.prototype, 'toQuery', {
	value: Object.prototype.toParam,
	writable: true,
	configureable: true,
	enumerable: false
});
