import Viking from '../../../../../src/viking';

(function () {
    module("Viking.View.Helpers#number_field_tag");

    // numberFieldTag(name, value = nil, options = {})
    // ===============================================
    test("numberFieldTag(name)", function() {
        equal(
            Viking.View.Helpers.numberFieldTag('count'),
            '<input id="count" name="count" type="number">'
        );
    });
    
    test("numberFieldTag(name, value)", function() {
        equal(
            Viking.View.Helpers.numberFieldTag('count', 10),
            '<input id="count" name="count" type="number" value="10">'
        );
    });
    
    test("numberFieldTag(name, value, {min: X, max: Y})", function() {
        equal(
            Viking.View.Helpers.numberFieldTag('count', 4, {min: 1, max: 9}),
            '<input id="count" max="9" min="1" name="count" type="number" value="4">'
        );
    });
    
    test("numberFieldTag(name, options)", function() {
        equal(
            Viking.View.Helpers.numberFieldTag('count', {step: 25}),
            '<input id="count" name="count" step="25" type="number">'
        );
    });
    
}());