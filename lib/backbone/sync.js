Backbone.sync = (function set(sync) {
    return function (method, model, options) {
        options || (options = {});

        var beforeSend = options.beforeSend;
        options.beforeSend = function(xhr) {
            var token = jQuery('meta[name="csrf-token"]').attr('content');
            if (token) { xhr.setRequestHeader('X-CSRF-Token', token); }
            if (beforeSend) { return beforeSend.apply(this, arguments); }
        };
        
        return sync.call(this, method, model, options);
    };
}(Backbone.sync));

(function($) {
    Backbone.Model.prototype.updateAttribute = function (key, value){
        var data;
        
        this.set(key, value);
        (data = {})[key] = value;
        this.updateAttributes(data);
    };
    
    Backbone.Model.prototype.updateAttributes = function (data){
        this.set(data);
        var scoped_data = {};
        scoped_data[_.result(this, 'paramRoot')] = data;
        this.sync('update', this, { data: scoped_data });
    };

}(jQuery));
