(function () {
    module("Viking.View.Helpers#label", {
        setup: function() {
            this.Model = Viking.Model.extend("model");
            this.model = new this.Model();
        }
    });
    
    // label(model, attribute, content, options)
    // =========================================
    test("label(model, attribute)", function() {
        equal( Viking.View.Helpers.label(this.model, 'key'), '<label for="model_key">Key</label>');
    });
    
    test("label(model, attribute, options)", function() {
        equal( Viking.View.Helpers.label(this.model, 'key', {class: 'options'}), '<label class="options" for="model_key">Key</label>');
    });
    
    test("label(model, attribute, content)", function() {
        equal( Viking.View.Helpers.label(this.model, 'key', 'Content'), '<label for="model_key">Content</label>');
        
        equal( Viking.View.Helpers.label(this.model, 'key', function() {return "Content";}), '<label for="model_key">Content</label>');
    });
    
    test("label(model, attribute, content, options)", function() {
        equal( Viking.View.Helpers.label(this.model, 'title', 'A short title', {class: 'title_label'}),
               '<label class="title_label" for="model_title">A short title</label>');
    });
    
    test("label(model, attribute, options, content)", function() {
        equal( Viking.View.Helpers.label(this.model, 'title', {class: 'title_label'}, function() { return 'A short title'; }),
               '<label class="title_label" for="model_title">A short title</label>');
    });
    
    test("label(model, attribute) with error on attribute", function() {
        this.model.validationError = {'eula': ['must be accepted']};
        
        equal( Viking.View.Helpers.label(this.model, 'eula'),
               '<label class="error" for="model_eula">Eula</label>');
    });
    
    test("label(model, attribute, {for: 'override'}) uses 'override' for the `for` attribute", function() {
        equal( Viking.View.Helpers.label(this.model, 'key', {for: 'override'}), '<label for="override">Key</label>');
    });
    
}());