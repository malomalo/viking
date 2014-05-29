// urlFor(modelOrUrl, options)
// ===========================
//
// Returns the URL for the model. Note that by default +:onlyPath+ is +true+ so
// you'll get the relative "/controller/action" instead of the fully qualified
// URL like "http://example.com/controller/action".
//
// Passing the model will trigger the named route for that record. The lookup
// will happen on the name of the class. So passing a Workshop object will attempt
// to use the +workshopPath+ route. If you have a nested route, such as
// +adminWorkshopPath+ you'll have to call that explicitly (it's impossible
// for +urlFor+ to guess that route).
//
// If a string is passed instead of a model, the string is simply returned.
//
// ==== Options
//   - anchor: Specifies the anchor name to be appended to the path.
//   - onlyPath: If +true+, returns the relative URL (omitting the protocol,
//               host name, and port) (+false+ by default).
//   - trailingSlash: If true, adds a trailing slash, as in "/archive/2005/".
//                     Note that this is currently not recommended since it
//                     breaks caching.
//   - host: Overrides the default (current) host if provided.
//   - port: Optionally specify the port to connect to
//   - protocol: Overrides the default (current) protocol if provided.
//   - scriptName: Specifies application path relative to domain root. If
//                 provided, prepends application path
//   - user: Inline HTTP authentication (only plucked out if +:password+ is also present).
//   - password: Inline HTTP authentication (only plucked out if +:user+ is also present).
//
// ==== Examples
//   urlFor(Workshop)
//   // uses +workshopsUrl()+
//   # => http://www.example.com/workshops
//
//   urlFor(new Workshop())
//   // relies on Workshop answering isNew() (and in this case returning true)
//   # => http://www.example.com/workshops
//
//   urlFor(workshop)
//   // uses +workshopUrl(model)+
//   // which calls workshop.toParam() which by default returns the id
//   // => http://www.example.com/workshops/5
//
//   // toParam() can be re-defined in a model to provide different URL names:
//   // => http://www.example.com/workshops/1-workshop-name
//
//   urlFor(workshop, {anchor: 'location'})
//   // => http://www.example.com/workshops/5#location
//
//   urlFor(workshop, {onlyPath: true})
//   // => /workshops/5
//
//   urlFor(workshop, {trailingSlash: true})
//   // => http://www.example.com/workshops/5/
//
//   urlFor(workshop, {host: 'myhost'})
//   // => http://myhost.com/workshops/5
//
//   urlFor(workshop, {port: 9292})
//   // => http://www.example.com:9292/workshops/5
//
//   urlFor(workshop, {protocol: 'https'})
//   // => https://www.example.com/workshops/5
//
//   urlFor(workshop, {scriptName: '/location'})
//   // => http://example.com/location/workshops/5
//
//   urlFor(workshop, {user: 'username', password: 'password'})
//   // => http://username:password@example.com/workshops/5
//
//   urlFor("http://www.example.com")
//   // => http://www.example.com
//
// TODO: support polymorhic_paths... ie [blog, post] => /blogs/1/posts/3
//       polymorphic_url([blog, post]) # => "http://example.com/blogs/1/posts/1"
//       polymorphic_url([:admin, blog, post]) # => "http://example.com/admin/blogs/1/posts/1"
//       polymorphic_url([user, :blog, post]) # => "http://example.com/users/1/blog/posts/1"
//       polymorphic_url(Comment) # => "http://example.com/comments"
//
urlFor = function (modelOrUrl, options) {
    if (typeof modelOrUrl === 'string') {
        return modelOrUrl;
    }
    
    options = _.extend({
        onlyPath: false,
        trailingSlash: false,
        host: window.location.hostname,
        port: window.location.port,
        scriptName: '',
        protocol: window.location.protocol.replace(':','')
    }, options);
    
    var route;
    var klass = modelOrUrl.modelName.camelize().constantize();
    if (modelOrUrl instanceof klass) {
        if (modelOrUrl.isNew()) {
            route = (klass.modelName.pluralize() + (options.onlyPath ? 'Path' : 'Url')).constantize();
            route = route();
        } else {
            route = (klass.modelName + (options.onlyPath ? 'Path' : 'Url')).constantize();
            route = route(modelOrUrl);
        }
    } else {
        route = (modelOrUrl.modelName.pluralize() + (options.onlyPath ? 'Path' : 'Url')).constantize();
        route = route();
    }
    
    if (!options.onlyPath) {
        route = options.protocol + '://' + options.host + (options.port ? ':' : '') + options.port + options.scriptName + route;
        
        if (options.user && options.password) {
            route = route.replace('://', '://' + options.user + ':' + options.password + '@');
        }
    }
    
    if (options.trailingSlash) {
        route += '/';
    }
    
    if (options.anchor) {
        route += '#' + options.anchor;
    }
    
    return route;
};