(function () {
    module("Viking.View.Helpers#button_tag");

    // // buttonTag(content, options) buttonTag(options, block)
    // // =======================================================
    test("buttonTag()", function() {
        equal(Viking.View.Helpers.buttonTag("Button"), '<button name="button" type="submit">Button</button>');
    });
    
    test("buttonTag(content, options)", function() {
        equal(Viking.View.Helpers.buttonTag("Checkout", {disabled: true}), '<button disabled name="button" type="submit">Checkout</button>');
    });
    
    test("buttonTag(options, block)", function() {
        equal(Viking.View.Helpers.buttonTag({type: "button"}, function() {
            return "Ask me!";
        }), '<button name="button" type="button">Ask me!</button>');
    });

}());