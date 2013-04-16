jQuery(document).ajaxSend(function(event, xhr, settings) {
    var token = jQuery('meta[name="csrf-token"]').attr('content');
    if (token) { xhr.setRequestHeader('X-CSRF-Token', token); }
});

Backbone.sync = (function set(sync) {
    return function (method, model, options) {
        options || (options = {});
        
        if (options.data === null && model && (method === 'create' || method === 'update' || method === 'patch')) {
            options.contentType = 'application/json';
            options.data = {};
            options.data[_.result(model, 'paramRoot')] = model.toJSON(options);
            options.data = JSON.stringify(options.data);
        }
        
        return sync.call(this, method, model, options);
    };
}(Backbone.sync));

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