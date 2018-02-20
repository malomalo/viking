import * as _ from 'underscore';

import { constantize } from '../../support/string';

import { contentTag } from './form_tags';

// linkTo(modelOrUrl, name, options)
// =================================
//
// Creates a link tag to the +modelOrUrl+. If +modelOrUrl+ is a model a href is
// generated from the routes. If a String is passed it is used as the href. See
// the documentation for +urlFor+ for how +modelOrUrl+ is translated into a url.
//
// ==== Signatures
//
//   linkTo(content, url)
//   
//   linkTo(content, url, options)
//
//   linkTo(url, contentFunc)
//
//   linkTo(url, options, contentFunc)
//
// ==== Options
//   - data: This option can be used to add custom data attributes.
// TODO: method not supported yet
//   - method: an HTTP verb. This modifier will dynamically create an HTML form
//             and immediately submit the form for processing using the HTTP verb
//             specified. Useful for having links perform a POST operation
//             in dangerous actions like deleting a record (which search bots can
//             follow while spidering your site). Supported verbs are +post+,
//             +:delete+, +:patch+, and +:put+.
//
// ==== Examples
//
//   linkTo("Profile", profilePath(profile))
//   // => <a href="/profiles/1">Profile</a>
//
// or the even pithier
//
//   linkTo("Profile", profile)
//   // => <a href="/profiles/1">Profile</a>
//
// Similarly,
//
//   linkTo("Profiles", profiles_path())
//   // => <a href="/profiles">Profiles</a>
//
// You can use a function as well if your link target is hard to fit into the
// name parameter. EJS example:
//
//   <%= linkTo(profile, function () { %>
//     <strong><%= profile.name %></strong> -- <span>Check it out!</span> 
//   <% }) %>
//   // => <a href="/profiles/1">
//          <strong>David</strong> -- <span>Check it out!</span>
//         </a>
//
// Classes and ids for CSS are easy to produce:
//
//   linkTo("Articles", articles_path(), {id: 'news', class: 'article'})
//   // => <a href="/articles" class="article" id="news">Articles</a>
//
// +linkTo+ can also produce links with anchors or query strings:
//
//   linkTo("Comment wall", profilePath(profile, {anchor: "wall"}))
//   // => <a href="/profiles/1#wall">Comment wall</a>
//
//   linkTo("Nonsense search", searches_path({foo: "bar", baz: "quux"}))
//   // => <a href="/searches?foo=bar&amp;baz=quux">Nonsense search</a>
//
// TODO: method not supported yet
// The only option specific to +linkTo+ (+:method+) is used as follows:
//
//   linkTo("Destroy", "http://www.example.com", {method: "delete"})
//   // => <a href='http://www.example.com' rel="nofollow" data-method="delete">Destroy</a>
//
// You can also use custom data attributes using the +:data+ option:
//
//   linkTo("Visit Other Site", "http://www.rubyonrails.org/", { data: { confirm: "Are you sure?" }})
//   // => <a href="http://www.rubyonrails.org/" data-confirm="Are you sure?">Visit Other Site</a>
export function linkTo(content, modelOrUrl, options) {
    var tmp;

    if (typeof modelOrUrl === 'function') {
        tmp = content;
        content = modelOrUrl;
        modelOrUrl = tmp;
    } else if (typeof options === 'function') {
        tmp = options;
        options = modelOrUrl;
        modelOrUrl = content;
        content = tmp;
    }

    options = Object.assign({
        href: urlFor(modelOrUrl)
    }, options);

    return contentTag('a', content, options);
};


// mailTo(email, name, options)
// mailTo(email, contentFunc)
// mailTo(email, options, contentFunc)
// =====================================================================
//
// Creates a mailto link tag to the specified +email+, which is
// also used as the name of the link unless +name+ is specified. Additional
// HTML attributes for the link can be passed in +options+.
//
// +mailTo+ has several methods for customizing the email itself by
// passing special keys to +options+.
//
// Options
// -------
//      - subject:  Preset the subject line of the email.
//      - body:     Preset the body of the email.
//      - cc:       Carbon Copy additional recipients on the email.
//      - bcc:      Blind Carbon Copy additional recipients on the email.
//
// Examples
// --------
//   mailTo('me@domain.com')
//   // => <a href="mailto:me@domain.com">me@domain.com</a>
//
//   mailTo('me@domain.com', 'My email')
//   // => <a href="mailto:me@domain.com">My email</a>
//
//   mailTo('me@domain.com', 'My email', {
//     cc: 'ccaddress@domain.com',
//     subject: 'This is an example email'
//   })
//   // => <a href="mailto:me@domain.com?cc=ccaddress@domain.com&subject=This%20is%20an%20example%20email">My email</a>
//
// You can use a function as well if your link target is hard to fit into the
// name parameter.
// 
//   mailTo('me@domain.com', function () {
//     return "<strong>Email me:</strong> <span>me@domain.com</span>";
//   });
//   // => <a href="mailto:me@domain.com"><strong>Email me:</strong> <span>me@domain.com</span></a>
//
//   mailTo('me@domain.com', {key: 'value'}, function () {
//     return "Email me";
//   });
//   // => <a href="mailto:me@domain.com" key="value">Email me</a>
//
//   mailTo('me@domain.com', function(){ return "Email me"; }, {key: 'value'});
//   // => <a href="mailto:me@domain.com" key="value">Email me</a>
export function mailTo(email, name, options?: any) {
    var tmp;

    // handle (email, name, options), (email, contentFunc), and 
    // (email, options, contentFunc) formats
    if (typeof options === 'function') {
        tmp = options;
        options = name;
        name = tmp;
    } else if (typeof name === 'object') {
        options = name;
        name = undefined;
    }
    if (name === undefined) {
        name = _.escape(email);
    }
    options || (options = {});

    var extras = _.map(_.pick(options, 'cc', 'bcc', 'body', 'subject'), function (value: string, key) {
        return key + '=' + encodeURI(value);
    }).join('&');
    if (extras.length > 0) { extras = '?' + extras; }
    options = _.omit(options, 'cc', 'bcc', 'body', 'subject');

    options.href = "mailto:" + email + extras;

    return contentTag('a', name, options, false);
};

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
export function urlFor(modelOrUrl, options?: any) {
    if (typeof modelOrUrl === 'string') {
        return modelOrUrl;
    }

    options = _.extend({
        onlyPath: false,
        trailingSlash: false,
        host: window.location.hostname,
        port: window.location.port,
        scriptName: '',
        protocol: window.location.protocol.replace(':', '')
    }, options);

    let route;
    const klass = modelOrUrl.baseModel.modelName.model();
    if (modelOrUrl instanceof klass) {
        if (modelOrUrl.isNew()) {
            route = constantize(klass.baseModel.modelName.plural + 'Path');
            route = route();
        } else {
            route = constantize(klass.baseModel.modelName.singular + 'Path');
            route = route(modelOrUrl);
        }
    } else {
        route = constantize(modelOrUrl.baseModel.modelName.plural + 'Path');
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