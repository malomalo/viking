(function () {
    module("Viking.View - tag_helpers");
    
    // tagOption(key, value, escape)
    // =========================================================================
    test("tagOption(string, string)", function() {
        equal(Viking.View.tagOption("key", "value>"), 'key="value>"');
    });

    test("tagOption(string, string, false)", function() {
        equal(Viking.View.tagOption("key", "<value>", false), 'key="<value>"');
    });
    
    test("tagOption(string, string, true)", function() {
        equal(Viking.View.tagOption("key", "<value>", true), 'key="&lt;value&gt;"');
    });
    
    test("tagOption(string, [string, string])", function() {
        equal(Viking.View.tagOption("key", ['v1', "<v2>"]), 'key="v1 <v2>"');
    });

    test("tagOption(string, [string, string], false)", function() {
        equal(Viking.View.tagOption("key", ['v1', "<v2>"], false), 'key="v1 <v2>"');
    });
    
    test("tagOption(string, [string, string], true)", function() {
        equal(Viking.View.tagOption("key", ['v1', "<v2>"], true), 'key="v1 &lt;v2&gt;"');
    });
    
    // dataTagOption(key, value, escape)
    // =========================================================================
    test("dataTagOption(string, string)", function() {
        equal(Viking.View.dataTagOption("key", "value>"), 'data-key="value>"');
    });
    
    test("dataTagOption(string, string, true)", function() {
        equal(Viking.View.dataTagOption("key", "value>", true), 'data-key="value&gt;"');
    });
    
    test("dataTagOption(string, object)", function() {
        equal(Viking.View.dataTagOption("key", {key: "value>"}), 'data-key="{"key":"value>"}"');
    });
    
    test("dataTagOption(string, object, true)", function() {
        equal(Viking.View.dataTagOption("key", {key: "value>"}, true), 'data-key="{&quot;key&quot;:&quot;value&gt;&quot;}"');
    });
    
    // tagOptions(options, escape)
    // =========================================================================
    test("tagOptions(undefined)", function() {
        equal(Viking.View.tagOptions(undefined), "")
    });
    
    test('tagOptions({key: "&value", keys: [1, "two>"]})', function() {
        equal(Viking.View.tagOptions({key: "&value", keys: [1, "two>"]}, true), ' key="&amp;value" keys="1 two&gt;"');
    });
    
    test('tagOptions({key: null, keys: undefined})', function() {
        equal(Viking.View.tagOptions({key: null, keys: undefined}), '');
    });
    
    test('tagOptions({key: "&value", keys: [1, "two>"]}, true)', function() {
        equal(Viking.View.tagOptions({key: "&value", keys: [1, "two>"]}, true), ' key="&amp;value" keys="1 two&gt;"');
    });
    
    test('tagOptions({key: "&value", keys: [1, "two>"]}, false)', function() {
        equal(Viking.View.tagOptions({key: "&value", keys: [1, "two>"]}, false), ' key="&value" keys="1 two>"');
    });
    
    test('tagOptions({selected: true})', function() {
        equal(Viking.View.tagOptions({selected: true}), ' selected');
    });
    
    // sanitizeToId(name)
    // =========================================================================
    test("sanitizeToId(modelName)", function() {
        equal("model_name", Viking.View.sanitizeToId("model[name]"));
    });
    
    // tagNameForModelAttribute(model, attribute)
    // =========================================================================
    test("tagNameForModelAttribute(model, attribute)", function() {
        var Model = Viking.Model.extend('model');
        var model = new Model({name: "name"});

        equal("model[name]", Viking.View.tagNameForModelAttribute(model, 'name'));
    });
    
    test("tagNameForModelAttribute(STImodel, attribute)", function() {
        var Model = Viking.Model.extend('model');
        var SubModel = Model.extend('sub_model');
        var submodel = new SubModel({name: "name"});

        equal("model[name]", Viking.View.tagNameForModelAttribute(submodel, 'name'));
    });
    
    test("tagNameForModelAttribute(model, attribute, {namespace: ...})", function() {
        var Model = Viking.Model.extend('model');
        var model = new Model({name: "name"});

        equal("key[model][name]", Viking.View.tagNameForModelAttribute(model, 'name', {namespace: 'key[model]'}));
    });
    
    test("tagNameForModelAttribute(model, arrayAttribute)", function() {
        var Model = Viking.Model.extend('model');
        var model = new Model({names: ["name"]});

        equal("model[names][]", Viking.View.tagNameForModelAttribute(model, 'names'));
    });
    
    test("tagNameForModelAttribute(model, arrayAttribute, {namespace: ...})", function() {
        var Model = Viking.Model.extend('model');
        var model = new Model({names: ["name"]});

        equal("key[model][names][]", Viking.View.tagNameForModelAttribute(model, 'names', {namespace: 'key[model]'}));
    });
    
    test("tagNameForModelAttribute(model, vikingCollectionAttribute)", function() {
        var Model = Viking.Model.extend('model');
        var ModelCollection = Viking.Collection.extend({model: Model});
        var model = new Model({models: new ModelCollection()});

        equal("model[models][]", Viking.View.tagNameForModelAttribute(model, 'models'));
    });
    
    test("tagNameForModelAttribute(model, vikingCollectionAttribute)", function() {
        var Model = Viking.Model.extend('model');
        var ModelCollection = Viking.Collection.extend({model: Model});
        var model = new Model({models: new ModelCollection()});

        equal("key[model][models][]", Viking.View.tagNameForModelAttribute(model, 'models', {namespace: 'key[model]'}));
    });
    
    // addErrorClassToOptions(model, attribute, options)
    // =========================================================================
    test("addErrorClassToOptions(model, attribute, options) - no error", function() {
        var Model = Viking.Model.extend('model');
        var model = new Model({name: "name"});

        var options = {};
        Viking.View.addErrorClassToOptions(model, 'name', options)
        deepEqual({}, options);
    });
    
    test("addErrorClassToOptions(model, attribute, options) - error, no class in options", function() {
        var Model = Viking.Model.extend('model');
        var model = new Model({name: "name"});
        model.errorsOn = function() { return true; }
        
        var options = {};
        Viking.View.addErrorClassToOptions(model, 'name', options)
        deepEqual({"class": "error"}, options);
    });

    test("addErrorClassToOptions(model, attribute, options) - error, class is string", function() {
        var Model = Viking.Model.extend('model');
        var model = new Model({name: "name"});
        model.errorsOn = function() { return true; }
        
        var options = {"class": "myclass"};
        Viking.View.addErrorClassToOptions(model, 'name', options)
        deepEqual({"class": "myclass error"}, options);
    });
    
    test("addErrorClassToOptions(model, attribute, options) - error, class is array", function() {
        var Model = Viking.Model.extend('model');
        var model = new Model({name: "name"});
        model.errorsOn = function() { return true; }
        
        var options = {"class": ["myclass"]};
        Viking.View.addErrorClassToOptions(model, 'name', options)
        deepEqual({"class": "myclass error"}, options);
    });
    
}());