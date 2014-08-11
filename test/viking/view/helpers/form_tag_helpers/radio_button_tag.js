(function () {
    module("Viking.View.Helpers#radio_button_tag");

    // // radioButtonTag(name, value, checked, options)
    // // =============================================
    test("radioButtonTag(name, value)", function() {
        equal( Viking.View.Helpers.radioButtonTag('gender', 'male'), '<input id="gender" name="gender" type="radio" value="male">');
    });
    
    test("radioButtonTag(name, value, checked)", function() {
        equal( Viking.View.Helpers.radioButtonTag('gender', 'male', true), '<input checked id="gender" name="gender" type="radio" value="male">');
    });
    
    test("radioButtonTag(name, value, checked, options)", function() {
        equal( Viking.View.Helpers.radioButtonTag('gender', 'male', false, {disabled: true}), '<input disabled id="gender" name="gender" type="radio" value="male">');
        
        equal( Viking.View.Helpers.radioButtonTag('gender', 'male', false, {'class': "myClass"}), '<input class="myClass" id="gender" name="gender" type="radio" value="male">');
    });

}());