// moneyField(model, attribute, options)
//
// same as numberField only it converts value from cents to dollars (val / 100)
Viking.View.Helpers.moneyField = function (model, attribute, options) {
    options = _.extend({class: "viking-money-field"}, options);
    var name = options.name || Viking.View.tagNameForModelAttribute(model, attribute);
    var value = model.get(attribute) / 100;

    Viking.View.addErrorClassToOptions(model, attribute, options);
    
    return Viking.View.Helpers.numberFieldTag(name, value, options);
};  