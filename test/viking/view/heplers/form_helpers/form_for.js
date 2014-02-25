(function () {
    module("Viking.View.Helpers#formFor", {
        setup: function() {
            this.Model = Viking.Model.extend("model");
            this.model = new this.Model();
        }
    });
    
    // formFor(model, options, content)
    // ==============================
    test("formFor(modelName, contentString)", function() {
        equal( Viking.View.Helpers.formFor(this.model, 'myform'), '<form>myform</form>');
    });
        
}());
