// Overwrite Backbone.Model#save so that we can catch errors when a save
// fails.
export const save = function(key, val, options) {
    let attrs, method, xhr, attributes = this.attributes;

    // Handle both `"key", value` and `{key: value}` -style arguments.
    if (key == null || typeof key === 'object') {
      attrs = key;
      options = val;
    } else {
      (attrs = {})[key] = val;
    }

    options = _.extend({validate: true}, options);

    // If we're not waiting and attributes exist, save acts as
    // `set(attr).save(null, opts)` with validation. Otherwise, check if
    // the model will be valid when the attributes, if any, are set.
    if (attrs && !options.wait) {
      if (!this.set(attrs, options)) { return false; }
    } else {
      if (!this._validate(attrs, options)) { return false; }
    }

    // Set temporary attributes if `{wait: true}`.
    if (attrs && options.wait) {
      this.attributes = _.extend({}, attributes, attrs);
    }

    // After a successful server-side save, the client is (optionally)
    // updated with the server-side state.
    if (options.parse === void 0) { options.parse = true; }
    let model = this;
    let success = options.success;
    options.success = function(resp) {
      // Ensure attributes are restored during synchronous saves.
      model.attributes = attributes;
      let serverAttrs = model.parse(resp, options);
      if (options.wait) { serverAttrs = _.extend(attrs || {}, serverAttrs); }
      if (_.isObject(serverAttrs) && !model.set(serverAttrs, options)) {
        return false;
      }
      if (success) { success(model, resp, options); }
      model.trigger('sync', model, resp, options);
    };

    // replacing #wrapError(this, options) with custom error handling to
    // catch and throw invalid events
    let error = options.error;
    options.error = function(resp) {
        if (resp.status === 400) {
            let errors = JSON.parse(resp.responseText).errors;
            if (options.invalid) {
                options.invalid(model, errors, options);
            }
            model.setErrors(errors, options);
        } else {
            if (error) { error(model, resp, options); }
            model.trigger('error', model, resp, options);
        }
    };

    method = this.isNew() ? 'create' : (options.patch ? 'patch' : 'update');
    if (method === 'patch') { options.attrs = attrs; }
    xhr = this.sync(method, this, options);

    // Restore attributes.
    if (attrs && options.wait) { this.attributes = attributes; }

    return xhr;
};
