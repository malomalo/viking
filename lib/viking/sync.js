// Viking.sync
// -------------
// Override Backbone.sync to process data for the ajax request with 
// +toParam()+ as opposed to letting jQuery automatically call $.param().
(function () {

    var MAX_URI_LENGTH = 2083;

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
        if (options.emulateJSON) { params.data._method = type; }
        var beforeSend = options.beforeSend;
        options.beforeSend = function(xhr) {
          xhr.setRequestHeader('X-HTTP-Method-Override', type);
          if (beforeSend) { return beforeSend.apply(this, arguments); }
        };
      }
      
      // Don't process data on a non-GET request.
      if (params.type !== 'GET' && !options.emulateJSON) {
        params.processData = false;
    } else if (options.data && typeof options.data === 'object') {
        var msgpackData = bin2String(msgpack.encode(options.data, {
            codec: MsgPackCodec
        }));

        if (type === 'GET' && params.url.length + msgpackData.length > MAX_URI_LENGTH) {
            options.type = 'POST';
            options.headers['X-Http-Method-Override'] = 'GET';
            options.data = JSON.stringify(options.data);
            options.contentType = 'application/json';
        } else {
            options.data = msgpackData
            options.headers = options.headers || {};
            options.headers['Query-Encoding'] = 'application/msgpack';
        }
    }

      

      // Make the request, allowing the user to override any Ajax options.
      var xhr = options.xhr = Viking.ajax(model, _.extend(params, options));
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

    Viking.ajax = function(model, options) {
        if (model instanceof Viking.Collection) {
            model = model.model.prototype;
        }

        if(model.connection) {
            options.url = model.connection.host + options.url;
            if (model.connection.withCredentials) {
                options.xhrFields = { withCredentials: true };
            }

            if (options.headers) {
                _.defaults(options.headers, model.connection.headers);
            } else {
                options.headers = model.connection.headers;
            }
        }

        // We only speak json
        if (options.headers) {
            _.defaults(options.headers, {
                'Accept': 'application/json'
            });
        } else {
            options.headers = {'Accept': 'application/json'};
        }

        return jQuery.ajax(options);
    }

}());