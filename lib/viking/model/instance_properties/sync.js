// Override [Backbone.Model#sync](http://backbonejs.org/#Model-sync).
// [Ruby on Rails](http://rubyonrails.org/) expects the attributes to be
// namespaced
Viking.Model.prototype.sync = function(method, model, options) {
    options || (options = {});

    if (options.data == null && (method === 'create' || method === 'update' || method === 'patch')) {
        options.contentType = 'application/json';
        options.data = {};
        options.data[_.result(model, 'paramRoot')] = (options.attrs || model.toJSON(options));
        options.data = JSON.stringify(options.data);
    }

    return Backbone.sync.call(this, method, model, options);
};