import Viking from '../../../../../src/viking';

(function () {
    module("Viking.View.Helpers#select_tag");

    // // selectTag(name, option_tags, options)
    // // ======================================
    test("selectTag(name, option_tags)", function() {
        equal( Viking.View.Helpers.selectTag('people', '<option value="$20">Basic</option>'),
               '<select id="people" name="people"><option value="$20">Basic</option></select>');
    });
    
    test("selectTag(name, option_tags, options)", function() {
        equal( Viking.View.Helpers.selectTag("colors", "<option>Red</option><option>Green</option><option>Blue</option>", {multiple: true}),
               '<select id="colors" multiple name="colors[]"><option>Red</option><option>Green</option><option>Blue</option></select>');
    });
    
    test("selectTag(name, option_tags, {includeBlank: true})", function() {
        equal( Viking.View.Helpers.selectTag('people', '<option value="$20">Basic</option>', {includeBlank: true}),
               '<select id="people" name="people"><option value=""></option><option value="$20">Basic</option></select>');
    });
    
    test("selectTag(name, option_tags, {prompt: 'Select somthing'})", function() {
        equal( Viking.View.Helpers.selectTag('people', '<option value="$20">Basic</option>', {prompt: 'Select somthing'}),
               '<select id="people" name="people"><option value="">Select somthing</option><option value="$20">Basic</option></select>');
    });

}());