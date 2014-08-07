//= require_self
//= require viking/view/helpers

// Viking.View
// -----------
//
// Viking.View is a framework fro handling view template lookup and rendering.
// It provides view helpers that assisst when building HTML forms and more.
Viking.View = Backbone.View.extend({}, {
    
    // Override the original extend function to support merging events
    extend: function(protoProps, staticProps) {
        
        if (protoProps  && protoProps.events) {
            _.defaults(protoProps.events, this.prototype.events);
        }
        
        return Backbone.View.extend.call(this, protoProps, staticProps);
      }
});

Viking.View.Helpers = {};