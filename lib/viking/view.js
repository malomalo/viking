// Viking.View
// -----------
//
// Viking.View is a simple extension of [Backbone.View](http://backbonejs.org/#View).
// When a Viking.View is extended events the parent events get merged in with
// the child events. When a Viking.View is instantiated the parent initalizers
// are also automatically called, first the parent's initalizer then the
// child's. 
Viking.View = Backbone.View.extend({    
}, {
    
    extend: function(protoProps, staticProps) {
		if(protoProps && protoProps.events && this.prototype.events) {
			_.defaults(protoProps.events, this.prototype.events)
		}
		
		if(protoProps && protoProps.initialize && this.prototype.initialize) {
			var parentInitialize = this.prototype.initialize;
			protoProps.initialize = _.wrap(protoProps.initialize, function(childInitialize, arguments) {
				parentInitialize.apply(this, arguments);
				childInitialize.apply(this, arguments);
			});
		}
		
		return Backbone.View.extend.call(this, protoProps, staticProps);
    }
});