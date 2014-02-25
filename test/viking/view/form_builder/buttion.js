(function () {
    module("Viking.View.FormBuilder#button", {
        setup: function() {
            this.Model = Viking.Model.extend("model");
            this.model = new this.Model();
        }
    });

    
    // button(value, options, content)
    // ================================
    test("button() with new model", function() {
        var form = new Viking.View.FormBuilder(this.model, '');

        equal(form.button(), '<button name="button" type="submit">Create model</button>');
    });
    
    test("button() with old model", function() {
        this.model.set('id', 12);
        var form = new Viking.View.FormBuilder(this.model, '');

        equal(form.button(), '<button name="button" type="submit">Update model</button>');
    });
    
    test("button(value)", function() {
        var form = new Viking.View.FormBuilder(this.model, '');

        equal(form.button('Create a model'), '<button name="button" type="submit">Create a model</button>');
    });
    
    test("button(valueFunc)", function() {
        var valueFunc = function() { return 'Create a model'; };
        var form = new Viking.View.FormBuilder(this.model, '');

        equal(form.button(valueFunc), '<button name="button" type="submit">Create a model</button>');
    });
    
    test("button(value, options)", function() {
        var form = new Viking.View.FormBuilder(this.model, '');

        equal(form.button('Create a model', {class: 'ten', type: 'button'}), '<button class="ten" name="button" type="button">Create a model</button>');
    });
    
    test("button(options)", function() {
        var form = new Viking.View.FormBuilder(this.model, '');

        equal(form.button({class: 'ten', type: 'button'}), '<button class="ten" name="button" type="button">Create model</button>');
    });
    
    test("button(options, value)", function() {
        var form = new Viking.View.FormBuilder(this.model, '');

        equal(form.button({class: 'ten', type: 'button'}), '<button class="ten" name="button" type="button">Create model</button>');
    });
    
    test("button(options, valueFunc)", function() {
        var valueFunc = function() { return 'Create a model'; };
        var form = new Viking.View.FormBuilder(this.model, '');

        equal(form.button({class: 'ten', type: 'button'}, valueFunc), '<button class="ten" name="button" type="button">Create a model</button>');
    });
        
}());