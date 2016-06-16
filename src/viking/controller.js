export const Controller = Backbone.Model.extend({
    
    // Below is the same code from the Backbone.Model function
    // except where there are comments
    constructor: function (attributes, options) {
        let attrs = attributes || {};
        options || (options = {});
        this.cid = _.uniqueId('c');
        this.attributes = {};
        if (options.collection) this.collection = options.collection;
        if (options.parse) attrs = this.parse(attrs, options) || {};
        attrs = _.defaults({}, attrs, _.result(this, 'defaults'));
        this.set(attrs, options);
        this.changed = {};
        this.initialize.apply(this, arguments);
        
        // Add a helper reference to get the model name from an model instance.
        this.controllerName = this.constructor.controllerName;
    }
    
}, {
    
    // Overide the default extend method to support passing in the controlelr name
    //
    // The name is helpful for determining the current controller and using it
    // as a key
    //
    // `name` is optional, and must be a string
    extend: function(controllerName, protoProps, staticProps) {
        if(typeof controllerName !== 'string') {
            staticProps = protoProps;
            protoProps = controllerName;
        }
        protoProps || (protoProps = {});
        
        let child = Backbone.Model.extend.call(this, protoProps, staticProps);

        if(typeof controllerName === 'string') { child.controllerName = controllerName; }
        
        _.each(protoProps, function(value, key) {
            if (typeof value === 'function') { child.prototype[key].controller = child; }
        });
        
        return child;
    }

});

export default Controller;
