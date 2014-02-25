(function () {
    module("Viking.View.FormBuilder", {
        setup: function() {
            this.Model = Viking.Model.extend("model");
            this.model = new this.Model();
        }
    });

    
    // new FormBuilder(model, options, template)
    // =========================================
    test("new FormBuilder(record, template)", function() {
        var form = new Viking.View.FormBuilder(this.model, '');

        equal(      form.model,     this.model  );
        deepEqual(  form.options,   {}          );
        equal(      form.template,  ''          );
        
        equal(form.toString(), '<form></form>');
    });
    
    test("new FormBuilder(record, options, template)", function() {
        var options = {key: 'value', foo: 3};
        var form = new Viking.View.FormBuilder(this.model, options, '');

        equal(      form.model,     this.model  );
        deepEqual(  form.options,   options     );
        equal(      form.template,  ''          );
        
        equal(form.toString(), '<form foo="3" key="value"></form>');
    });
        
}());