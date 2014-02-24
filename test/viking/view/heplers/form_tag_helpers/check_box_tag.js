(function () {
    module("Viking.View.Helpers#check_box_tag");

    // // checkBoxTag(name, value="1", checked=false, options)
    // // ======================================================
    test("checkBoxTag(name)", function() {
        equal( Viking.View.Helpers.checkBoxTag("accept"), '<input id="accept" name="accept" type="checkbox" value="1">');
    });
    
    test("checkBoxTag(name, value)", function() {
        equal( Viking.View.Helpers.checkBoxTag('rock', 'rock music'), '<input id="rock" name="rock" type="checkbox" value="rock music">');
    });
    
    test("checkBoxTag(name, value, checked)", function() {
        equal( Viking.View.Helpers.checkBoxTag('receive_email', 'yes', true), '<input checked id="receive_email" name="receive_email" type="checkbox" value="yes">');
    });
    
    test("checkBoxTag(name, value, checked, options)", function() {
        equal( Viking.View.Helpers.checkBoxTag('tos', 'yes', false, {class: 'accept_tos'}), '<input class="accept_tos" id="tos" name="tos" type="checkbox" value="yes">');
    });

}());