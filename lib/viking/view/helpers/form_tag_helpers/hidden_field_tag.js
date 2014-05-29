// hiddenFieldTag(name, value = nil, options = {})
// ===============================================
//
// Creates a hidden form input field used to transmit data that would be lost
// due to HTTP's statelessness or data that should be hidden from the user.
//
// Options
// -------
//      - Any key creates standard HTML attributes for the tag
//
// Examples
// --------
//   hiddenFieldTag('tags_list')
//   // => <input name="tags_list" type="hidden">
//   
//   hiddenFieldTag('token', 'VUBJKB23UIVI1UU1VOBVI@')
//   // => <input name="token" type="hidden" value="VUBJKB23UIVI1UU1VOBVI@">
Viking.View.Helpers.hiddenFieldTag = function (name, value, options) {
    if (options === undefined) { options = {}; }
    _.defaults(options, {type: "hidden", id: null});

    return Viking.View.Helpers.textFieldTag(name, value, options);
};
