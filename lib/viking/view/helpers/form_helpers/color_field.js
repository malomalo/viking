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
Viking.View.Helpers.colorField = function (model, attribute, options) {
    options = _.extend({}, options);
    var name = options.name || Viking.View.tagNameForModelAttribute(model, attribute, options);

    Viking.View.addErrorClassToOptions(model, attribute, options);
    
    return Viking.View.Helpers.colorFieldTag(name, model.get(attribute), options);
};