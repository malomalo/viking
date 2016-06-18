import Viking from '../../../../../src/viking';

(function () {
    module("Viking.View.Helpers#text_area", {
        setup: function() {
            this.Model = Viking.Model.extend("model");
            this.model = new this.Model();
        }
    });
    
    // textArea(model, attribute, options)
    // ===================================
    test("textArea(model, attribute)", function() {
        equal( Viking.View.Helpers.textArea(this.model, 'notes'), '<textarea id="model_notes" name="model[notes]"></textarea>')
        
        this.model.set('notes', 'test')
        equal( Viking.View.Helpers.textArea(this.model, 'notes'), '<textarea id="model_notes" name="model[notes]">test</textarea>')
    });
    
    test("textArea(model, attribute, options)", function() {
        equal( Viking.View.Helpers.textArea(this.model, 'notes', {size: '20x40'}), '<textarea cols="20" id="model_notes" name="model[notes]" rows="40"></textarea>')
    });
    
    test("textArea(model, attribute) with error on attribute", function() {
        this.model.validationError = {'notes': ['must not be blank']};
        
        equal( Viking.View.Helpers.textArea(this.model, 'notes'),
               '<textarea class="error" id="model_notes" name="model[notes]"></textarea>');
    });

    
}());