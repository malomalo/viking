// selectTag(name, optionTags, options)
// ====================================
//
// Creates a dropdown selection box, or if the :multiple option is set to true,
// a multiple choice selection box.
//
// Options
// -------
//    - multiple:      If set to true the selection will allow multiple choices.
//    - disabled:      If set to true, the user will not be able to use this input.
//    - includeBlank:  If set to true, an empty option will be created, can pass a string to use as empty option content
//    - prompt:        Create a prompt option with blank value and the text asking user to select something
//    - Any other key creates standard HTML attributes for the tag.
//
// Examples
// --------
//   selectTag("people", options_for_select({ "Basic": "$20"}))
//   // <select name="people"><option value="$20">Basic</option></select>
//   
//   selectTag("people", "<option>David</option>")
//   // => <select name="people"><option>David</option></select>
//   
//   selectTag("count", "<option>1</option><option>2</option><option>3</option>")
//   // => <select name="count"><option>1</option><option>2</option><option>3</option></select>
//   
//   selectTag("colors", "<option>Red</option><option>Green</option><option>Blue</option>", {multiple: true})
//   // => <select multiple="multiple" name="colors[]"><option>Red</option>
//   //    <option>Green</option><option>Blue</option></select>
//   
//   selectTag("locations", "<option>Home</option><option selected='selected'>Work</option><option>Out</option>")
//   // => <select name="locations"><option>Home</option><option selected='selected'>Work</option>
//   //    <option>Out</option></select>
//   
//   selectTag("access", "<option>Read</option><option>Write</option>", {multiple: true, class: 'form_input'})
//   // => <select class="form_input" multiple="multiple" name="access[]"><option>Read</option>
//   //    <option>Write</option></select>
//   
//   selectTag("people", options_for_select({ "Basic": "$20"}), {includeBlank: true})
//   // => <select name="people"><option value=""></option><option value="$20">Basic</option></select>
//   
//   selectTag("people", options_for_select({"Basic": "$20"}), {prompt: "Select something"})
//   // => <select name="people"><option value="">Select something</option><option value="$20">Basic</option></select>
//   
//   selectTag("destination", "<option>NYC</option>", {disabled: true})
//   // => <select disabled name="destination"><option>NYC</option></select>
//   
//   selectTag("credit_card", options_for_select([ "VISA", "MasterCard" ], "MasterCard"))
//   // => <select name="credit_card"><option>VISA</option><option selected>MasterCard</option></select>
Viking.View.Helpers.selectTag = function (name, optionTags, options) {
    let tagName = name;
    if (options === undefined) { options = {}; }
    if (options.multiple && tagName.slice(-2) !== "[]") { tagName = tagName + "[]"; }
    _.defaults(options, {
        id: Viking.View.sanitizeToId(name),
        name: tagName
    });

    if (options.includeBlank) {
        let content = typeof options.includeBlank == "string" ? options.includeBlank : "";
        optionTags = Viking.View.Helpers.contentTag('option', content, {value: ''}) + optionTags;
        delete options.includeBlank;
    }

    if (options.prompt) {
        if (options.prompt === true) { options.prompt = 'Select'; }
        optionTags = Viking.View.Helpers.contentTag('option', options.prompt, {value: ''}) + optionTags;
        delete options.prompt;
    }

    return Viking.View.Helpers.contentTag('select', optionTags, options, false);
};
