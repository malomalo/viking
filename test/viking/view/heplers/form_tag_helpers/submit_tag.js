(function () {
    module("Viking.View.Helpers#submit_tag");

    // // submitTag(value="Save", options)
    // // =================================
    test("submitTag()", function() {
        equal(Viking.View.Helpers.submitTag(), '<input name="commit" type="submit" value="Save">');
    });
    
    test("submitTag(value)", function() {
        equal(Viking.View.Helpers.submitTag("Edit this article"), '<input name="commit" type="submit" value="Edit this article">');
    });
    
    test("submitTag(value, options)", function() {
        equal(Viking.View.Helpers.submitTag("Edit", {disabled: true, class: 'butn'}), '<input class="butn" disabled name="commit" type="submit" value="Edit">');
    });
    
    test("submitTag(value)", function() {
        equal(Viking.View.Helpers.submitTag(null, {class: 'btn'}), '<input class="btn" name="commit" type="submit" value="Save">');
    });

}());