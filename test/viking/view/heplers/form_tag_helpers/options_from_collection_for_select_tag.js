(function () {
    module("Viking.View.Helpers#options_from_collection_for_select_tag");

    // optionsFromCollectionForSelectTag(collection, valueAttribute, textAttribute, selected)
    // ===================================================================================
    test("optionsFromCollectionForSelectTag(collection, valueAttribute, textAttribute)", function() {
        var Model = Viking.Model.extend("model");
        var Collection = Viking.Collection.extend({model: Model});
        
        var c = new Collection([{id: 1, name: 'one'}, {id: 2, name: 'two'}, {id: 3, name: 'three'}]);
        
        equal( Viking.View.Helpers.optionsFromCollectionForSelectTag(c, 'id', 'name'),
               '<option value="1">one</option>\n<option value="2">two</option>\n<option value="3">three</option>');
    });
    
    test("optionsFromCollectionForSelectTag(collection, valueFunc, textFunc)", function() {
        var Model = Viking.Model.extend("model");
        var Collection = Viking.Collection.extend({model: Model});
        
        var c = new Collection([{id: 1, name: 'one'}, {id: 2, name: 'two'}, {id: 3, name: 'three'}]);
        
        equal( Viking.View.Helpers.optionsFromCollectionForSelectTag(c, function(m) { return m.id; }, function(m) { return m.get('name'); }),
               '<option value="1">one</option>\n<option value="2">two</option>\n<option value="3">three</option>');
    });
    
    test("optionsFromCollectionForSelectTag(collection, valueAttribute, textAttribute, selected)", function() {
        var Model = Viking.Model.extend("model");
        var Collection = Viking.Collection.extend({model: Model});
        
        var c = new Collection([{id: 1, name: 'one'}, {id: 2, name: 'two'}, {id: 3, name: 'three'}]);
        
        equal( Viking.View.Helpers.optionsFromCollectionForSelectTag(c, 'id', 'name', 2),
               '<option value="1">one</option>\n<option selected value="2">two</option>\n<option value="3">three</option>');
    });
    
    test("optionsFromCollectionForSelectTag(collection, valueAttribute, textAttribute, [selected...])", function() {
        var Model = Viking.Model.extend("model");
        var Collection = Viking.Collection.extend({model: Model});
        
        var c = new Collection([{id: 1, name: 'one'}, {id: 2, name: 'two'}, {id: 3, name: 'three'}]);
        
        equal( Viking.View.Helpers.optionsFromCollectionForSelectTag(c, 'id', 'name', [2,3]),
               '<option value="1">one</option>\n<option selected value="2">two</option>\n<option selected value="3">three</option>');
    });
    
    test("optionsFromCollectionForSelectTag(collection, valueAttribute, textAttribute, {selected: ?, disabled: ?})", function() {
        var Model = Viking.Model.extend("model");
        var Collection = Viking.Collection.extend({model: Model});
        
        var c = new Collection([{id: 1, name: 'one'}, {id: 2, name: 'two'}, {id: 3, name: 'three'}]);
        
        equal( Viking.View.Helpers.optionsFromCollectionForSelectTag(c, 'id', 'name', {selected: 1, disabled: 3}),
               '<option selected value="1">one</option>\n<option value="2">two</option>\n<option disabled value="3">three</option>');
    });
    
    test("optionsFromCollectionForSelectTag(collection, valueAttribute, textAttribute, {selected: [?], disabled: [?]})", function() {
        var Model = Viking.Model.extend("model");
        var Collection = Viking.Collection.extend({model: Model});
        
        var c = new Collection([{id: 1, name: 'one'}, {id: 2, name: 'two'}, {id: 3, name: 'three'}]);
        
        equal( Viking.View.Helpers.optionsFromCollectionForSelectTag(c, 'id', 'name', {selected: [1], disabled: [3]}),
               '<option selected value="1">one</option>\n<option value="2">two</option>\n<option disabled value="3">three</option>');
    });
    
    test("optionsFromCollectionForSelectTag(collection, valueAttribute, textAttribute, selectedFunc)", function() {
        var Model = Viking.Model.extend("model");
        var Collection = Viking.Collection.extend({model: Model});
        
        var c = new Collection([{id: 1, name: 'one'}, {id: 2, name: 'two'}, {id: 3, name: 'three'}]);
        
        equal( Viking.View.Helpers.optionsFromCollectionForSelectTag(c, 'id', 'name', function(m) { return m === 1; }),
               '<option selected value="1">one</option>\n<option value="2">two</option>\n<option value="3">three</option>');
    });
    
    test("optionsFromCollectionForSelectTag(collection, valueAttribute, textAttribute, {selected: selectedFunc, disabled: disabledFunc})", function() {
        var Model = Viking.Model.extend("model");
        var Collection = Viking.Collection.extend({model: Model});
        
        var c = new Collection([{id: 1, name: 'one'}, {id: 2, name: 'two'}, {id: 3, name: 'three'}]);
        
        equal( Viking.View.Helpers.optionsFromCollectionForSelectTag(c, 'id', 'name', {
                   selected: function(m) { return m === 1; },
                   disabled: function(m) { return m === 3; }}),
               '<option selected value="1">one</option>\n<option value="2">two</option>\n<option disabled value="3">three</option>');
    });

}());