// We need to remove these because they interfere with other libraires that use
// the for (x in var) loops
delete Object.prototype.toParam
delete Object.prototype.toQuery
delete Array.prototype.toParam
delete Array.prototype.toQuery

_.toParam = function(value, namespace) {
    if (value.toParam) {
        return value.toParam(namespace);
    } else if (_.isArray(value)) {
        return _.map(value, function(e) { return _.toParam(e); }).join('/');
    } else if (typeof value === 'object') {
		return _.map(value, function(value, key) {
			var namespaceWithKey = (namespace ? (namespace + "[" + key + "]") : key);

			if (value !== null && value !== undefined) {
				return _.toQuery(value, namespaceWithKey);
			}

			return escape(namespaceWithKey) + "=";

		}).join('&');
    }
}

_.toQuery = function(value, namespace) {
    if (value.toQuery) {
        return value.toQuery(namespace);
    } else if (_.isArray(value)) {
	var prefix = namespace + "[]";
	return _.map(value, function(value) { return value === null ? escape(prefix) + '=' : _.toQuery(value, prefix); }).join('&');
    } else if (typeof value === 'object') {
        return _.toParam(value, namespace);
    }
}

(function () {

    Viking.sync = function(method, model, options) {
      var type = methodMap[method];

      // Default options, unless specified.
      _.defaults(options || (options = {}), {
        emulateHTTP: Backbone.emulateHTTP,
        emulateJSON: Backbone.emulateJSON
      });

      // Default JSON-request options.
      var params = {type: type, dataType: 'json'};

      // Ensure that we have a URL.
      if (!options.url) {
        params.url = _.result(model, 'url') || urlError();
      }

      // Ensure that we have the appropriate request data.
      if (options.data == null && model && (method === 'create' || method === 'update' || method === 'patch')) {
        params.contentType = 'application/json';
        params.data = JSON.stringify(options.attrs || model.toJSON(options));
      }

      // For older servers, emulate JSON by encoding the request into an HTML-form.
      if (options.emulateJSON) {
        params.contentType = 'application/x-www-form-urlencoded';
        params.data = params.data ? {model: params.data} : {};
      }

      // For older servers, emulate HTTP by mimicking the HTTP method with `_method`
      // And an `X-HTTP-Method-Override` header.
      if (options.emulateHTTP && (type === 'PUT' || type === 'DELETE' || type === 'PATCH')) {
        params.type = 'POST';
        if (options.emulateJSON) params.data._method = type;
        var beforeSend = options.beforeSend;
        options.beforeSend = function(xhr) {
          xhr.setRequestHeader('X-HTTP-Method-Override', type);
          if (beforeSend) return beforeSend.apply(this, arguments);
        };
      }

      // Don't process data on a non-GET request.
      if (params.type !== 'GET' && !options.emulateJSON) {
        params.processData = false;
      } else if (options.data && typeof options.data === 'object') {
        options.data = _.toParam(options.data);
      }

      // If we're sending a `PATCH` request, and we're in an old Internet Explorer
      // that still has ActiveX enabled by default, override jQuery to use that
      // for XHR instead. Remove this line when jQuery supports `PATCH` on IE8.
      if (params.type === 'PATCH' && noXhrPatch) {
        params.xhr = function() {
          return new ActiveXObject("Microsoft.XMLHTTP");
        };
      }

      // Make the request, allowing the user to override any Ajax options.
      var xhr = options.xhr = Backbone.ajax(_.extend(params, options));
      model.trigger('request', model, xhr, options);
      return xhr;
    };

    var noXhrPatch =
      typeof window !== 'undefined' && !!window.ActiveXObject &&
        !(window.XMLHttpRequest && (new XMLHttpRequest).dispatchEvent);

    // Map from CRUD to HTTP for our default `Backbone.sync` implementation.
    var methodMap = {
      'create': 'POST',
      'update': 'PUT',
      'patch':  'PATCH',
      'delete': 'DELETE',
      'read':   'GET'
    };

}());