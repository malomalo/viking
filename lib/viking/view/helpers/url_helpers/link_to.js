// linkTo(modelOrUrl, name, options)
// =================================
//
// Creates a link tag to the +modelOrUrl+. If +modelOrUrl+ is a model a href is
// generated from the routes. If a String is passed it is used as the href. See
// the documentation for +urlFor+ for how +modelOrUrl+ is translated into a url.
//
// ==== Signatures
//
//   linkTo(url)
//   
//   linkTo(url, body)
//
//   linkTo(url, body, options)
//
//   linkTo(url, options)
//
//   linkTo(url, options, body)
//
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
//   linkTo(profilePath(profile), "Profile")
//   // => <a href="/profiles/1">Profile</a>
//
// or the even pithier
//
//   linkTo(profile, "Profile")
//   // => <a href="/profiles/1">Profile</a>
//
// Similarly,
//
//   linkTo(profiles_path(), "Profiles")
//   // => <a href="/profiles">Profiles</a>
//
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
//   linkTo(articles_path(), "Articles", {id: 'news', class: 'article'})
//   // => <a href="/articles" class="article" id="news">Articles</a>
//
// +linkTo+ can also produce links with anchors or query strings:
//
//   linkTo(profilePath(profile, {anchor: "wall"}), "Comment wall")
//   // => <a href="/profiles/1#wall">Comment wall</a>
//
//   linkTo(searches_path({foo: "bar", baz: "quux"}), "Nonsense search")
//   // => <a href="/searches?foo=bar&amp;baz=quux">Nonsense search</a>
//
// TODO: method not supported yet
// The only option specific to +linkTo+ (+:method+) is used as follows:
//
//   linkTo("http://www.example.com", "Destroy", {method: "delete"})
//   // => <a href='http://www.example.com' rel="nofollow" data-method="delete">Destroy</a>
//
// You can also use custom data attributes using the +:data+ option:
//
//   linkTo("http://www.rubyonrails.org/", "Visit Other Site", { data: { confirm: "Are you sure?" }})
//   // => <a href="http://www.rubyonrails.org/" data-confirm="Are you sure?">Visit Other Site</a>
Viking.View.Helpers.linkTo = function (modelOrUrl, name, options) {
    if (typeof name === 'object') {
        var tmp = options;
        options = name;
        name = tmp;
    }
    
    options = _.extend({
        href: urlFor(modelOrUrl)
    }, options);
    
    if (!name) { 
        if (modelOrUrl instanceof Viking.Model) {
            if (modelOrUrl.isNew()) {
                name = 'new ' + modelOrUrl.modelName.humanize();
            } else {
                name = modelOrUrl.modelName.humanize() + ' #' + modelOrUrl.id;
            }
        } else if (modelOrUrl.modelName) {
            name = modelOrUrl.modelName.pluralize().humanize();
        } else {
            name = modelOrUrl;
        }
    }

    return Viking.View.Helpers.contentTag('a', name, options);
};

        // 
        // html_options, options, name = options, name, block if block_given?
        // options ||= {}
        // 
        // html_options = convert_options_to_data_attributes(options, html_options)
        // 
        // url = url_for(options)
        // html_options['href'] ||= url
        // 
        // content_tag(:a, name || url, html_options, &block)
