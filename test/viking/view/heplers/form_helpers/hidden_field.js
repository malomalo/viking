(function () {
    module("Viking.View.Helpers#hidden_field", {
        setup: function() {
            this.Model = Viking.Model.extend("model");
            this.model = new this.Model();
        }
    });
    
    // hiddenField(model, attribute, options)
    // ======================================
    test("hiddenField(model, attribute)", function() {
        equal( Viking.View.Helpers.hiddenField(this.model, 'key'),
               '<input name="model[key]" type="hidden" value="">');
        
        this.model.set('key', 'token');
        equal( Viking.View.Helpers.hiddenField(this.model, 'key'),
               '<input name="model[key]" type="hidden" value="token">');
    });
    
    test("hiddenField(model, attribute, options)", function() {
        equal( Viking.View.Helpers.hiddenField(this.model, 'key', {class: 'test'}),
               '<input class="test" name="model[key]" type="hidden" value="">');
    });
    
    test("hiddenField(model, attribute, options) allows name to be overridden", function() {
        equal( Viking.View.Helpers.hiddenField(this.model, 'key', {name: 'overridden'}),
               '<input name="overridden" type="hidden" value="">');
    });
    
}());