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
Viking.View.Helpers.linkTo = function (content, modelOrUrl, options) {
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
    
    options = _.extend({
        href: urlFor(modelOrUrl)
    }, options);

    return Viking.View.Helpers.contentTag('a', content, options);
};