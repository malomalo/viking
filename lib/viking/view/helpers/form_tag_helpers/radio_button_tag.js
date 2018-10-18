// radioButtonTag(name, value, checked, options)
// =============================================
//
// Creates a radio button; use groups of radio buttons named the same to allow
// users to select from a group of options.
//
// Options
// -------
//      - disabled: If true, the user will not be able to use this input.
//      - Any other key creates standard HTML attributes for the tag
//
// Examples
// --------
//   radioButtonTag('gender', 'male')
//   // => <input name="gender" type="radio" value="male">
//   
//   radioButtonTag('receive_updates', 'no', true)
//   // => <input checked="checked" name="receive_updates" type="radio" value="no">
//
//   radioButtonTag('time_slot', "3:00 p.m.", false, {disabled: true})
//   // => <input disabled name="time_slot" type="radio" value="3:00 p.m.">
//   
//   radioButtonTag('color', "green", true, {class: "color_input"})
//   // => <input checked class="color_input" name="color" type="radio" value="green">
Viking.View.Helpers.radioButtonTag = function (name, value, checked, options) {
    if (options === undefined) { options = {}; }
    if (checked === true) { options.checked = true; }
    if (options.checked === false) { delete options.checked; }
    _.defaults(options, {
        type: "radio",
        value: value,
        name: name,
        id: Viking.View.sanitizeToId(name)
    });

    return Viking.View.Helpers.tag("input", options);
};
