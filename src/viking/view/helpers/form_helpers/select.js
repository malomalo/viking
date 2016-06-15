// Create a select tag and a series of contained option tags for the provided
// object and method. The option currently held by the object will be selected,
// provided that the object is available.
//
// There are two possible formats for the +choices+ parameter, corresponding
// to other helpers' output:
//
// * A flat collection (see +optionsForSelect+).
//
// * A nested collection (see +groupedOptionsForSelect+).
//
// For example:
//
//   select("post", "person_id", _.map(people, function(p) { return [p.name, p.id] }), { include_blank: true })
//
// would become:
//
//   <select name="post[person_id]">
//     <option value=""></option>
//     <option value="1" selected="selected">David</option>
//     <option value="2">Sam</option>
//     <option value="3">Tobias</option>
//   </select>
//
// assuming the associated person has ID 1.
//
// By default, `post.get('person_id')` is the selected option. Specify
// `selected: value` to use a different selection or `selected: nil` to leave
// all options unselected. Similarly, you can specify values to be disabled in
// the option tags by specifying the `:disabled` option. This can either be a
// single value or an array of values to be disabled.
//
// ==== Gotcha
//
// The HTML specification says when +multiple+ parameter passed to select and
// all options got deselected web browsers do not send any value to server.
// Unfortunately this introduces a gotcha: if an +User+ model has many +roles+
// and have +role_ids+ accessor, and in the form that edits roles of the user
// the user deselects all roles from +role_ids+ multiple select box, no
// +role_ids+ parameter is sent. So, any mass-assignment idiom like
//
//   @user.update(params[:user])
//
// wouldn't update roles.
//
// To prevent this the helper generates an auxiliary hidden field before every
// multiple select. The hidden field has the same name as multiple select and
// blank value.
//
// This way, the client either sends only the hidden field (representing
// the deselected multiple select box), or both fields. Since the HTML
// specification says key/value pairs have to be sent in the same order they
// appear in the form, and parameters extraction gets the last occurrence of
// any repeated key in the query string, that works for ordinary forms.
//
// In case if you don't want the helper to generate this hidden field you can
// specify `include_hidden: false` option.
Viking.View.Helpers.select = function (model, attribute, collection, options) {
    if (options === undefined) { options = {}; }

    let name = options['name'] || Viking.View.tagNameForModelAttribute(model, attribute);
    let optionOptions = _.pick(options, 'selected');
    let selectOptions = _.omit(options, 'selected');
    if (model.get(attribute) && optionOptions.selected === undefined) {
        optionOptions.selected = model.get(attribute);
    }
    if (selectOptions.multiple === undefined && model.associations[attribute] && model.associations[attribute].macro === "hasMany") {
        selectOptions.multiple = true;
    }
    return Viking.View.Helpers.selectTag(name, Viking.View.Helpers.optionsForSelectTag(collection, optionOptions), selectOptions);
};