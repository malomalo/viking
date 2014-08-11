(function () {
    module("Viking.View.Helpers#label_tag");

    // // labelTag(name, content, options) (name, options, block)
    // // =======================================================
    test("labelTag(content)", function() {
        equal( Viking.View.Helpers.labelTag("Name"), '<label>Name</label>');
    });
    
    test("labelTag(content, options)", function() {
        equal( Viking.View.Helpers.labelTag("Name", {'for': "input"}), '<label for="input">Name</label>');
    });
	
    test("labelTag(content, options, escape)", function() {
        equal( Viking.View.Helpers.labelTag("<Name>", {'for': "input"}, false), '<label for="input"><Name></label>');
    });
    
    test("labelTag(block)", function() {
        equal( Viking.View.Helpers.labelTag(function() { return "Name"; }), '<label>Name</label>');
    });
        
    test("labelTag(options, block)", function() {
        equal( Viking.View.Helpers.labelTag({'for': "input"}, function() { return "Name"; }), '<label for="input">Name</label>');
    });

}());