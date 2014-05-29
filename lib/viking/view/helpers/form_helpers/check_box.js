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
Viking.View.Helpers.checkBox = function (model, attribute, options, checkedValue, uncheckedValue) {
    var output = '';
    var value = model.get(attribute);

    if (options === undefined) { options = {}; }
    if (checkedValue === undefined) { checkedValue = true; }
    if (uncheckedValue === undefined) { uncheckedValue = false; }
    Viking.View.addErrorClassToOptions(model, attribute, options);

    var name = options.name || Viking.View.tagNameForModelAttribute(model, attribute);    
    output += Viking.View.Helpers.hiddenFieldTag(name, uncheckedValue);
    output += Viking.View.Helpers.checkBoxTag(name, checkedValue, checkedValue === value, options);
    
    return output;
};