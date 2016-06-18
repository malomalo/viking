import Viking from '../../../../../src/viking';

(function () {
    module("Viking.View.Helpers#hidden_field_tag");

    // // hiddenFieldTag(name, value = nil, options = {})
    // // ===============================================
    test("hiddenFieldTag(name)", function() {
        equal( Viking.View.Helpers.hiddenFieldTag('tags_list'), '<input name="tags_list" type="hidden">');
    });
    
    test("hiddenFieldTag(name, value)", function() {
        equal( Viking.View.Helpers.hiddenFieldTag('token', 'VUBJKB23UIVI1UU1VOBVI@'), '<input name="token" type="hidden" value="VUBJKB23UIVI1UU1VOBVI@">');
    });
    
    test("hiddenFieldTag(name, value, options)", function() {
        equal( Viking.View.Helpers.hiddenFieldTag('token', 'VUBJKB23UIVI1UU1VOBVI@', {'class': 'mine'}),
               '<input class="mine" name="token" type="hidden" value="VUBJKB23UIVI1UU1VOBVI@">');
    });

}());