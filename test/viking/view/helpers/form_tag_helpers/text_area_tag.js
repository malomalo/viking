import Viking from '../../../../../src/viking';

(function () {
    module("Viking.View.Helpers#text_area_tag");

    // // textAreaTag(name, [content], [options], [escape=true])
    // // ========================================================
    test("textAreaTag(name)", function() {
        equal(Viking.View.Helpers.textAreaTag('post'), '<textarea id="post" name="post"></textarea>');
    });
    
    test("textAreaTag(name, content)", function() {
        equal(Viking.View.Helpers.textAreaTag('post', 'paragraph'), '<textarea id="post" name="post">paragraph</textarea>');
    });
    
    test("textAreaTag(name, null, {rows: 10, cols: 25})", function() {
        equal(Viking.View.Helpers.textAreaTag('post', null, {rows: 10, cols: 25}), '<textarea cols="25" id="post" name="post" rows="10"></textarea>');
    });
    
    test("textAreaTag(name, null, {size: '10x25'})", function() {
        equal(Viking.View.Helpers.textAreaTag('post', null, {size: '10x25'}), '<textarea cols="10" id="post" name="post" rows="25"></textarea>');
    });

}());