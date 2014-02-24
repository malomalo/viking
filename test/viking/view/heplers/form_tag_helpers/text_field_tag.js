(function () {
    module("Viking.View.Helpers#text_field_tag");

    // // textFieldTag(name, [value], [options])
    // // =========================================
    test("textFieldTag(name)", function() {
        equal( Viking.View.Helpers.textFieldTag('name'),
               '<input id="name" name="name" type="text">');
    });
    
    test("textFieldTag(name, value)", function() {
        equal( Viking.View.Helpers.textFieldTag('query', 'search'),
               '<input id="query" name="query" type="text" value="search">');
    });
    
    test("textFieldTag(name, {placeholder: value})", function() {
        equal( Viking.View.Helpers.textFieldTag('query', {placeholder: 'search'}),
               '<input id="query" name="query" placeholder="search" type="text">');
    });
    
    test("textFieldTag(name, {maxlength: 5})", function() {
        equal( Viking.View.Helpers.textFieldTag('query', {maxlength: 5}),
               '<input id="query" maxlength="5" name="query" type="text">');
    });
    
    test("textFieldTag(name, options)", function() {
        equal( Viking.View.Helpers.textFieldTag('query', {class: 'search'}),
               '<input class="search" id="query" name="query" type="text">');
    });
    
    test("textFieldTag(name, value, options)", function() {
        equal( Viking.View.Helpers.textFieldTag('query', '', {size: 75}),
               '<input id="query" name="query" size="75" type="text" value="">');
    });
    
    test("textFieldTag(name, value, disabled_option)", function() {
        equal( Viking.View.Helpers.textFieldTag('payment_amount', '$0.00', {disabled: true}),
               '<input disabled id="payment_amount" name="payment_amount" type="text" value="$0.00">');
    });
    
    test("testFieldTag(name, model)", function() {
        equal( Viking.View.Helpers.textFieldTag('payment_amount', new Backbone.Model(), {disabled: true, value: 10}),
               '<input disabled id="payment_amount" name="payment_amount" type="text" value="10">');
    });

}());