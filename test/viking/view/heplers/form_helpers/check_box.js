(function () {
    module("Viking.View.Helpers#check_box", {
        setup: function() {
            this.Model = Viking.Model.extend("model");
            this.model = new this.Model();
        }
    });

    // checkBox(model, attribute, options, checkedValue, uncheckedValue)
    // =================================================================
    test("checkBox(model, attribute)", function() {
        this.model.set('key', true);
        equal( Viking.View.Helpers.checkBox(this.model, 'key'),
               '<input name="model[key]" type="hidden" value="false"><input checked id="model_key" name="model[key]" type="checkbox" value="true">');
        
        this.model.set('key', false);
        equal( Viking.View.Helpers.checkBox(this.model, 'key'),
               '<input name="model[key]" type="hidden" value="false"><input id="model_key" name="model[key]" type="checkbox" value="true">');
    });
    
    test("checkBox(model, attribute, {}, yesValue, noValue)", function() {
        this.model.set('key', 'yes');
        equal( Viking.View.Helpers.checkBox(this.model, 'key', {}, 'yes', 'no'),
               '<input name="model[key]" type="hidden" value="no"><input checked id="model_key" name="model[key]" type="checkbox" value="yes">');
        
        this.model.set('key', 'no');
        equal( Viking.View.Helpers.checkBox(this.model, 'key', {}, 'yes', 'no'),
               '<input name="model[key]" type="hidden" value="no"><input id="model_key" name="model[key]" type="checkbox" value="yes">');
    });
    
    test("checkBox(model, attribute, options)", function() {
        this.model.set('key', 'yes');
        equal( Viking.View.Helpers.checkBox(this.model, 'key', { class: 'eula_check' }, 'yes', 'no'),
               '<input name="model[key]" type="hidden" value="no"><input checked class="eula_check" id="model_key" name="model[key]" type="checkbox" value="yes">');
        
        this.model.set('key', 'no');
        equal( Viking.View.Helpers.checkBox(this.model, 'key', { class: 'eula_check' }, 'yes', 'no'),
               '<input name="model[key]" type="hidden" value="no"><input class="eula_check" id="model_key" name="model[key]" type="checkbox" value="yes">');
    });
    
    test("checkBox(model, attribute) with error on attribute", function() {
        this.model.validationError = {'eula': ['must be accepted']};
        
        equal( Viking.View.Helpers.checkBox(this.model, 'eula'),
               '<input name="model[eula]" type="hidden" value="false"><input class="error" id="model_eula" name="model[eula]" type="checkbox" value="true">');
               
       equal( Viking.View.Helpers.checkBox(this.model, 'eula', {class: 'eula'}, 'yes', 'no'),
              '<input name="model[eula]" type="hidden" value="no"><input class="eula error" id="model_eula" name="model[eula]" type="checkbox" value="yes">');
    });
    
    test("checkBox(model, attribute, options) allows you to override the name attribute on the html tag", function() {
        this.model.set('key', 'yes');
        equal( Viking.View.Helpers.checkBox(this.model, 'key', { name: 'eula_yes' }, 'yes', 'no'),
               '<input name="eula_yes" type="hidden" value="no"><input checked id="eula_yes" name="eula_yes" type="checkbox" value="yes">');
    });
    
}());