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
Viking.View.Helpers.mailTo = function (email, name, options) {
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
    
    var extras = _.map(_.pick(options, 'cc', 'bcc', 'body', 'subject'), function(value, key) {
        return key + '=' + encodeURI(value);
    }).join('&');
    if (extras.length > 0) { extras = '?' + extras; }
    options = _.omit(options, 'cc', 'bcc', 'body', 'subject');
    
    options.href = "mailto:" + email + extras;

    return Viking.View.Helpers.contentTag('a', name, options, false);
};