import FormBuilder from '../builders/formBuilder';
import CheckBoxGroupBuilder from '../builders/checkBoxGroupBuilder';
import { contentTag, textFieldTag } from './tagHelpers';

import { humanize } from '../../support/string';

import {
    addErrorClassToOptions,
    methodOrAttribute,
    sanitizeToId,
    tagNameForModelAttribute
} from './tagHelpers';

// checkBoxGroup(model, attribute, options = {}, content = func(f))
// ================================================================
// 
// Usefull for rendering an checkbox group. checkBox generates an auxiliary
// hidden field before the very check box that has the same name to mimic an
// unchecked box. Using checkBox within checkBoxGroup will not generate the
// auxiliary field.
//
// A useful example of this is when you have an array of items to choose from.
//
// Examples
// --------
//   checkBoxGroup(account, 'roles', function (f) {
//       return f.checkBox('admin') + "\n" + f.checkBox('agent', { class: 'agent_check' });
//   });
//   // => <input checked id="account_roles_admin" type="checkbox" name="account[roles][]" value="admin">
//   // => <input checked class="agent_check" id="account_roles_agent" type="checkbox" name="account[roles][]" value="agent">
export function checkBoxGroup(model, attribute, options, content) {
    if (typeof options === 'function') {
        content = options;
        options = {};
    }

    var builder = new CheckBoxGroupBuilder(model, attribute, options);

    return content(builder);
};

// checkBox(model, attribute, options={}, checkedValue="true", uncheckedValue="false")
// =====================================================================================
//
// Returns a checkbox tag tailored for accessing a specified attribute (identified
// by attribute) on an object. This object must be an instance of Viking.Model.
// Additional options on the input tag can be passed as a hash with options.
// The checkedValue defaults to the string `"true"` while the default
// uncheckedValue is set to the string `"false"`.
//
// Gotcha
// ------
//
// The HTML specification says unchecked check boxes are not successful, and
// thus web browsers do not send them. Unfortunately this introduces a gotcha:
// if an Invoice model has a paid flag, and in the form that edits a paid invoice
// the user unchecks its check box, no paid parameter is sent. So, any
// mass-assignment idiom like
//
//   @invoice.update(params[:invoice])
//
// wouldn't update the flag.
//
// To prevent this the helper generates an auxiliary hidden field before the very
// check box. The hidden field has the same name and its attributes mimic an
// unchecked check box.
//
// This way, the client either sends only the hidden field (representing the
// check box is unchecked), or both fields. Since the HTML specification says
// key/value pairs have to be sent in the same order they appear in the form,
// and parameters extraction gets the last occurrence of any repeated key in
// the query string, that works for ordinary forms.
//
// Unfortunately that workaround does not work when the check box goes within an
// array-like parameter, as in
// 
// <%= fields_for "project[invoice_attributes][]", invoice, index: nil do |form| %>
//   <%= form.check_box :paid %>
//   ...
// <% end %>
//
// because parameter name repetition is precisely what Rails seeks to distinguish
// the elements of the array. For each item with a checked check box you get an
// extra ghost item with only that attribute, assigned to "0".
//
// In that case it is preferable to either use check_box_tag or to use hashes
// instead of arrays.
//
// Examples
// --------
//   // Let's say that post.get('validated') is `true`:
//   checkBox(post, "validated")
//   // => <input name="post[validated]" type="hidden" value="false">
//   //    <input checked type="checkbox" name="post[validated]" value="true">
//   
//   // Let's say that puppy.get('gooddog') is `"no"`:
//   checkBox("puppy", "gooddog", {}, "yes", "no")
//   // => <input name="puppy[gooddog]" type="hidden" value="no">
//   //    <input type="checkbox" name="puppy[gooddog]" value="yes">
//   
//   checkBox("eula", "accepted", { class: 'eula_check' }, "yes", "no")
//   // => <input name="eula[accepted]" type="hidden" value="no">
//   //    <input type="checkbox" class="eula_check" name="eula[accepted]" value="yes">
export function checkBox(model, attribute, options, checkedValue, uncheckedValue, escape) {
    var output = '';
    var value = model.get(attribute);

    if (options === undefined) { options = {}; }
    if (checkedValue === undefined) { checkedValue = true; }
    if (uncheckedValue === undefined) { uncheckedValue = false; }

    addErrorClassToOptions(model, attribute, options);

    var name = options.name || tagNameForModelAttribute(model, attribute);
    output += hiddenFieldTag(name, uncheckedValue, undefined, escape);
    output += checkBoxTag(name, checkedValue, checkedValue === value, options, escape);

    return output;
};

// collectionSelect(model, attribute, collection, valueAttribute, textAttribute, options)
// ====================================================================================
//
// Returns <select> and <option> tags for the collection of existing return
// values of method for object's class. The value returned from calling method
// on the instance object will be selected. If calling method returns nil, no
// selection is made without including :prompt or :includeBlank in the options
// hash.
//
// The :value_method and :text_method parameters are methods to be called on
// each member of collection. The return values are used as the value attribute
// and contents of each <option> tag, respectively. They can also be any object
// that responds to call, such as a proc, that will be called for each member
// of the collection to retrieve the value/text.
//
// Example object structure for use with this method:
//
//   Post = Viking.Model.extend({
//       belongsTo: ['author']
//   });
//   
//   Author = Viking.Model.extend({
//       hasMany: ['posts'],
//       
//       nameWithInitial: function() {
//           return this.get('first_name')[0] + '. ' + this.get("last_name");
//       }
//   });
// 
// Sample usage (selecting the associated Author for an instance of Post):
//
//   collectionSelect(post, 'author_id', Author.all, 'id', 'nameWithInitial', {prompt: true})
// 
// If post.get('author_id') is already 1, this would return:
// 
//   <select name="post[author_id]">
//     <option value="">Please select</option>
//     <option value="1" selected>D. Heinemeier Hansson</option>
//     <option value="2">D. Thomas</option>
//     <option value="3">M. Clark</option>
//   </select>
export function collectionSelect(model, attribute, collection, valueAttribute, textAttribute, options = {}) {
    var optionOptions = _.pick(options, 'selected');
    var selectOptions = _.omit(options, 'selected');
    if (model.get(attribute) && optionOptions.selected === undefined) {
        optionOptions.selected = methodOrAttribute(model.get(attribute), valueAttribute);
    }

    var name = options.name || tagNameForModelAttribute(model, attribute);
    var optionsTags = optionsFromCollectionForSelectTag(collection, valueAttribute, textAttribute, selectOptions);
    return selectTag(name, optionsTags, selectOptions);
};

// colorField(model, attribute, options)
// ======================================
//
// Returns an input tag of the "color" type tailored for accessing a specified
// attribute on the model. Additional options on the input tag can be passed as
// a hash with options. These options will be tagged onto the HTML as an HTML
// element attribute as in the example shown.
//
// Examples
// --------
//   colorField(brand, 'accent')
//   // => <input id="brand_accent" name="brand[accent]" type="color">
export function colorField(model, attribute, options) {
    options = _.extend({}, options);
    var name = options.name || tagNameForModelAttribute(model, attribute);

    addErrorClassToOptions(model, attribute, options);

    return colorFieldTag(name, model.get(attribute), options);
};

// formFor(model, options = {}, content = func(f))
// ===============================================
// 
// Creates a FormBuilder for the model and passes it as the first argument to
// the `content` function.
//
// Examples
// --------
//   formFor(account, function (f) { return f.hiddenField('pass_confirm'); })
//   // => <input type="hidden" name="account[pass_confirm]" value="">
export function formFor(model, options, content) {
    if (typeof options === 'function') {
        content = options;
        options = {};
    }

    var method = options.method;
    if (options.multipart === true) {
        options.enctype = "multipart/form-data";
        options.method = 'post';
        delete options.multipart;
    } else if (!options.method) {
        options.method = 'get';
    }

    var builder = new FormBuilder(model, options);
    if ((options.method !== 'get' && options.method !== 'post') || (method && method !== options.method)) {
        options.method = 'post';
        content = _.wrap(content, function (func, form) {
            var hiddenInput = hiddenFieldTag('_method', method);
            return contentTag('div', hiddenInput, { style: 'margin:0;padding:0;display:inline' }, false) + func(builder);
        });
    }

    return contentTag('form', content(builder), options, false);
};

// hiddenField(model, attribute, options = {})
// =========================================
// 
// Returns a hidden input tag tailored for accessing a specified attribute
// (identified by method) on an object assigned to the template (identified
// by object). Additional options on the input tag can be passed as a hash
// with options. These options will be tagged onto the HTML as an HTML element
// attribute as in the example shown.
//
// Examples
// --------
//   hiddenField(:signup, :pass_confirm)
//   // => <input type="hidden" name="signup[pass_confirm]" value="">
//   
//   hiddenField(:post, :tag_list)
//   // => <input type="hidden" name="post[tag_list]" value="tag1 tag2 tag3">
//   
//   hiddenField(:user, :token)
//   // => <input type="hidden" name="user[token]" value="token">
export function hiddenField(model, attribute, options) {
    var value = model.get(attribute);
    var name = tagNameForModelAttribute(model, attribute);

    return hiddenFieldTag(name, (value || ''), options);
};

// label(model, attribute, content, options)
// =========================================
//
// Returns a label tag tailored for labelling an input field for a specified
// attribute (identified by method) on an object assigned to the template
// (identified by object). The text of label will default to the attribute
// name unless a translation is found in the current I18n locale (through
// helpers.label.<modelname>.<attribute>) or you specify it explicitly.
// Additional options on the label tag can be passed as a hash with options.
// These options will be tagged onto the HTML as an HTML element attribute as
// in the example shown, except for the :value option, which is designed to
// target labels for #radioButton tags (where the value is used in the ID
// of the input tag).
//
// Examples
// --------
//   label(post, "title")
//   // => <label for="post_title">Title</label>
//   
//   label(post, "title", "A short title")
//   // => <label for="post_title">A short title</label>
//   
//   label(post, "title", "A short title", {class: "title_label"})
//   // => <label for="post_title" class="title_label">A short title</label>
//   
//   label(post, "privacy", "Public Post", {value: "public"})
//   // => <label for="post_privacy_public">Public Post</label>
//   
//   label(post, "terms", function() {
//       return 'Accept <a href="/terms">Terms</a>.';
//   })
//   // => <label for="post_privacy_public">Public Post</label>
export function label(model, attribute, content, options, escape) {
    var tmp;
    if (typeof content === 'object') {
        tmp = options;
        options = content;
        content = tmp;
    }

    if (options === undefined) { options = {}; }
    if (content === undefined) { content = humanize(attribute); }
    if (typeof content === 'function') { content = content(); }
    if (!options['for']) {
        var name = tagNameForModelAttribute(model, attribute);
        options['for'] = sanitizeToId(name);
    }
    if (options['value']) {
        options['for'] += "_" + options['value'];
    }

    addErrorClassToOptions(model, attribute, options);

    return labelTag(content, options, escape);
};

// moneyField(model, attribute, options)
//
// same as numberField only it converts value from cents to dollars (val / 100)
export function moneyField(model, attribute, options) {
    options = _.extend({ class: "viking-money-field" }, options);
    var name = options.name || tagNameForModelAttribute(model, attribute);
    var value = model.get(attribute) / 100;

    addErrorClassToOptions(model, attribute, options);

    return numberFieldTag(name, value, options);
};

// numberField(model, attribute, options)
// ======================================
//
// Returns an input tag of the "number" type tailored for accessing a specified
// attribute on the model. Additional options on the input tag can be passed as
// a hash with options. These options will be tagged onto the HTML as an HTML
// element attribute as in the example shown.
//
// Examples
// --------
//   numberField(user, 'age', {min: 0, max: 100})
//   // => <input id="user_age" name="user[age]" type="number" value="27">
//   
//   numberField(account, 'requests', {class: "form_input"})
//   // => <input class="form_input" id="account_requests" name="account[requests]" type="number" value="27">
export function numberField(model, attribute, options) {
    options = _.extend({}, options);
    var name = options.name || tagNameForModelAttribute(model, attribute);

    addErrorClassToOptions(model, attribute, options);

    return numberFieldTag(name, model.get(attribute), options);
};

// passwordField(model, attribute, options)
// ========================================
//
// Returns an input tag of the "password" type tailored for accessing a specified
// attribute on the model. Additional options on the input tag can be passed as
// a hash with options. These options will be tagged onto the HTML as an HTML
// element attribute as in the example shown. For security reasons this field
// is blank by default; pass value via options if this is not desired.
//
// Examples
// --------
//   passwordField(user, 'pass', {size: 20})
//   // => <input id="login_pass" name="login[pass]" type="password" size="20">
//   
//   passwordField(account, 'secret', {class: "form_input", value: account.get('secret')})
//   // => <input class="form_input" id="account_secret" name="account[secret]" type="password" value="unkown">
export function passwordField(model, attribute, options) {
    options || (options = {});
    var name = options.name || tagNameForModelAttribute(model, attribute);

    if (options === undefined) { options = {}; }
    addErrorClassToOptions(model, attribute, options);

    return passwordFieldTag(name, undefined, options);
};

// radioButton(model, attribute, tagValue, options)
// ==================================================
//
// Returns a radio button tag for accessing a specified attribute on a model.
// If the current value of attribute is tagValue the radio button will be checked.
//
// To force the radio button to be checked pass checked: true in the options hash.
// You may pass HTML options there as well.
//   
//   // Let's say that @post.category returns "rails":
//   radioButton("post", "category", "rails")
//   radioButton("post", "category", "java")
//   // => <input type="radio" id="post_category_rails" name="post[category]" value="rails" checked>
//   //    <input type="radio" id="post_category_java" name="post[category]" value="java">
//   
//   radioButton("user", "receive_newsletter", "yes")
//   radioButton("user", "receive_newsletter", "no")
//   // => <input type="radio" id="user_receive_newsletter_yes" name="user[receive_newsletter]" value="yes">
//   //    <input type="radio" id="user_receive_newsletter_no" name="user[receive_newsletter]" value="no" checked>
export function radioButton(model, attribute, tagValue, options) {
    if (options === undefined) { options = {}; }
    var name = options.name || tagNameForModelAttribute(model, attribute);

    _.defaults(options, {
        id: sanitizeToId(name + "_" + tagValue)
    });
    addErrorClassToOptions(model, attribute, options);

    var value = tagValue;
    if (value === undefined || value === null) {
        value = "";
    }

    return radioButtonTag(name, value, tagValue === model.get(attribute), options);
};

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
export function select(model, attribute, collection, options) {
    if (options === undefined) { options = {}; }

    var name = options['name'] || tagNameForModelAttribute(model, attribute);
    var optionOptions = _.pick(options, 'selected');
    var selectOptions = _.omit(options, 'selected');
    if (model.get(attribute) && optionOptions.selected === undefined) {
        optionOptions.selected = model.get(attribute);
    }
    if (selectOptions.multiple === undefined && model.associations[attribute] && model.associations[attribute].macro === "hasMany") {
        selectOptions.multiple = true;
    }
    return selectTag(name, optionsForSelectTag(collection, optionOptions), selectOptions);
};

// textArea(model, attribute, options)
// ====================================
//
// Returns a textarea opening and closing tag set tailored for accessing a
// specified attribute on a model. Additional options on the input tag can be
// passed as a hash with options.
//
// Examples
// ========
//   textArea(post, 'body', {cols: 20, rows: 40})
//   // => <textarea cols="20" rows="40" id="post_body" name="post[body]">
//   //      post body
//   //    </textarea>
//   
//   textArea(comment, 'text', {size: "20x30"})
//   // => <textarea cols="20" rows="30" id="comment_text" name="comment[text]">
//   //      comment text
//   //    </textarea>
//   
//   textArea(application, 'notes', {cols: 40, rows: 15, class: 'app_input'})
//   // => <textarea cols="40" rows="15" id="application_notes" name="application[notes]" class="app_input">
//   //      application notes
//   //    </textarea>
//   
//   textArea(entry, 'body', {size: "20x20", disabled: true})
//   // => <textarea cols="20" rows="20" id="entry_body" name="entry[body]" disabled>
//   //      entry body
//   //    </textarea>
export function textArea(model, attribute, options = {}) {
    var name = options['name'] || tagNameForModelAttribute(model, attribute);

    if (options === undefined) { options = {}; }
    addErrorClassToOptions(model, attribute, options);

    var value = model.get(attribute)
    if (model.schema && model.schema[attribute] && model.schema[attribute].type == 'json') {
        value = JSON.stringify(model.get(attribute), undefined, 4);
    }

    return textAreaTag(name, value, options);
};

// textField(model, attribute, options)
// ====================================
//
// Returns an input tag of the "text" type tailored for accessing a specified
// attribute on a model. Additional options on the input tag can be passed as
// a hash with options. These options will be tagged onto the HTML as an HTML
// element attribute as in the example shown.
//
// Examples
// ========
//   text_field(post, "title", {size: 20})
//   // => <input id="post_title" name="post[title]" size="20" type="text" value="title">
//   
//   text_field(post, "title", {class: "create_input"})
//   // => <input class="create_input" id="post_title" name="post[title]" type="text" value="title">
export function textField(model, attribute, options = {}) {
    addErrorClassToOptions(model, attribute, options);

    var name = options['name'] || tagNameForModelAttribute(model, attribute);
    var value = model.readAttribute(attribute)
    value = value && typeof value === 'object' ? value.toString() : value
    return textFieldTag(name, value, options);
};
