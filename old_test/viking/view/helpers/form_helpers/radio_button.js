(function () {
    module("Viking.View.Helpers#radio_button", {
        setup: function() {
            this.Model = Viking.Model.extend("model");
            this.model = new this.Model();
        }
    });
    
    // radioButton(model, attribute, tag_value, options)
    // =================================================
    test("radioButton(model, attribute, tag_value)", function() {
        this.model.set('category', 'rails');
        
        equal( Viking.View.Helpers.radioButton(this.model, "category", "rails"), '<input checked id="model_category_rails" name="model[category]" type="radio" value="rails">')
        equal( Viking.View.Helpers.radioButton(this.model, "category", "java"), '<input id="model_category_java" name="model[category]" type="radio" value="java">')
    });
    
    test("radioButton(model, attribute, tag_value, options)", function() {
        equal( Viking.View.Helpers.radioButton(this.model, "category", "yes", {id: 'test'}), '<input id="test" name="model[category]" type="radio" value="yes">')
        equal( Viking.View.Helpers.radioButton(this.model, "category", "no", {checked: true}), '<input checked id="model_category_no" name="model[category]" type="radio" value="no">')
    });
    
    test("radioButton(model, attribute) with error on attribute", function() {
        this.model.validationError = {'eula': ['must be accepted']};
        
        equal( Viking.View.Helpers.radioButton(this.model, 'eula', 'true'),
               '<input class="error" id="model_eula_true" name="model[eula]" type="radio" value="true">');
    });
    
    test("radioButton(model, attribute) allows name to be overridden", function() {
        equal( Viking.View.Helpers.radioButton(this.model, 'eula', 'true', {name: 'overridden'}),
               '<input id="overridden_true" name="overridden" type="radio" value="true">');
    });
    
}());