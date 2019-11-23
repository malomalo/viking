import 'mocha';
import * as assert from 'assert';
import Model from 'viking/model';
import {
    addErrorClassToOptions,
    contentTag,
    sanitizeToId,
    tagOption,
    tagNameForModelAttribute,
    tagOptions,
    dataTagOption,
    tag,
    imageTag, buttonTag, checkBoxTag, labelTag, formTag, hiddenFieldTag, textFieldTag,
    submitTag, numberFieldTag, radioButtonTag, passwordFieldTag, timeTag, textAreaTag,
    selectTag, optionsFromCollectionForSelectTag, optionsForSelectTag
} from 'viking/view/helpers/tagHelpers';

describe('Helpers.tagHelpers', () => {
    
    describe('tag', () => {
        it("tag(name)", () => {
            assert.equal(tag("br"), "<br>");
        });
    
        it("tag(name, options)", () => {
            assert.equal(tag("input", {type: "text"}), '<input type="text">');
        });

        it("tag(name, options) options are escaped by default", () => {
            assert.equal(tag("img", {src: "open & shut.png"}), '<img src="open &#38; shut.png">');
        });
    
        it("tag(name, options, false) options are not escaped", () => {
            assert.equal(tag("img", {src: "open &#38; shut.png"}, false), '<img src="open &#38; shut.png">');
        });
    
        it("tag(name, boolean_options)", () => {
            assert.equal(tag("input", {selected: true}), '<input selected>');
        });
    
        it("tag(name, data_options)", () => {
            assert.equal(tag("div", {data: {name: 'Stephen', city_state: ["Chicago", "IL"]}}),
                 '<div data-city_state="[&#34;Chicago&#34;,&#34;IL&#34;]" data-name="Stephen">');
        }); 
    });
    
    // describe('addErrorClassToOptions', () => {
    //     it("addErrorClassToOptions(model, attribute, options) - no error", () => {
    //         var Model = Viking.Model.extend('model');
    //         var model = new Model({ name: "name" });
    //
    //         var options = {};
    //         Viking.View.addErrorClassToOptions(model, 'name', options)
    //         assert.deepEqual({}, options);
    //     });
    //
    //     it("addErrorClassToOptions(model, attribute, options) - error, no class in options", () => {
    //         var Model = Viking.Model.extend('model');
    //         var model = new Model({ name: "name" });
    //         model.errorsOn = function () { return true; }
    //
    //         var options = {};
    //         Viking.View.addErrorClassToOptions(model, 'name', options)
    //         assert.deepEqual({ "class": "error" }, options);
    //     });
    //
    //     it("addErrorClassToOptions(model, attribute, options) - error, class is string", () => {
    //         var Model = Viking.Model.extend('model');
    //         var model = new Model({ name: "name" });
    //         model.errorsOn = function () { return true; }
    //
    //         var options = { "class": "myclass" };
    //         Viking.View.addErrorClassToOptions(model, 'name', options)
    //         assert.deepEqual({ "class": "myclass error" }, options);
    //     });
    //
    //     it("addErrorClassToOptions(model, attribute, options) - error, class is array", () => {
    //         var Model = Viking.Model.extend('model');
    //         var model = new Model({ name: "name" });
    //         model.errorsOn = function () { return true; }
    //
    //         var options = { "class": ["myclass"] };
    //         Viking.View.addErrorClassToOptions(model, 'name', options)
    //         assert.deepEqual({ "class": "myclass error" }, options);
    //     });
    // });
    
    // describe('tagNameForModelAttribute', () => {
    //     it("tagNameForModelAttribute(model, attribute)", () => {
    //         var Model = Viking.Model.extend('model');
    //         var model = new Model({ name: "name" });
    //
    //         assert.equal("model[name]", Viking.View.tagNameForModelAttribute(model, 'name'));
    //     });
    //
    //     it("tagNameForModelAttribute(STImodel, attribute)", () => {
    //         var Model = Viking.Model.extend('model');
    //         var SubModel = Model.extend('sub_model');
    //         var submodel = new SubModel({ name: "name" });
    //
    //         assert.equal("model[name]", Viking.View.tagNameForModelAttribute(submodel, 'name'));
    //     });
    //
    //     it("tagNameForModelAttribute(model, attribute, {namespace: ...})", () => {
    //         var Model = Viking.Model.extend('model');
    //         var model = new Model({ name: "name" });
    //
    //         assert.equal("key[model][name]", Viking.View.tagNameForModelAttribute(model, 'name', { namespace: 'key[model]' }));
    //     });
    //
    //     it("tagNameForModelAttribute(model, arrayAttribute)", () => {
    //         var Model = Viking.Model.extend('model');
    //         var model = new Model({ names: ["name"] });
    //
    //         assert.equal("model[names][]", Viking.View.tagNameForModelAttribute(model, 'names'));
    //     });
    //
    //     it("tagNameForModelAttribute(model, arrayAttribute, {namespace: ...})", () => {
    //         var Model = Viking.Model.extend('model');
    //         var model = new Model({ names: ["name"] });
    //
    //         assert.equal("key[model][names][]", Viking.View.tagNameForModelAttribute(model, 'names', { namespace: 'key[model]' }));
    //     });
    //
    //     it("tagNameForModelAttribute(model, vikingCollectionAttribute)", () => {
    //         var Model = Viking.Model.extend('model');
    //         var ModelCollection = Viking.Collection.extend({ model: Model });
    //         var model = new Model({ models: new ModelCollection() });
    //
    //         assert.equal("model[models][]", Viking.View.tagNameForModelAttribute(model, 'models'));
    //     });
    //
    //     it("tagNameForModelAttribute(model, vikingCollectionAttribute)", () => {
    //         var Model = Viking.Model.extend('model');
    //         var ModelCollection = Viking.Collection.extend({ model: Model });
    //         var model = new Model({ models: new ModelCollection() });
    //
    //         assert.equal("key[model][models][]", Viking.View.tagNameForModelAttribute(model, 'models', { namespace: 'key[model]' }));
    //     });
    // });
    
    describe('contentTag', () => {
        it("contentTag(name, content)", () => {
            assert.equal(
                contentTag('p', 'Hello world & all!'),
                "<p>Hello world &#38; all!</p>"
            )
        });
    
        it("contentTag(name, content, escape)", () => {
            assert.equal(
                contentTag("p", "Hello world & all!", false),
                "<p>Hello world & all!</p>"
            );
        });
    
        it("contentTag(name, content, options)", () => {
            assert.equal(
                contentTag('p', 'Hello world & all!', {'class': "strong"}),
                '<p class="strong">Hello world &#38; all!</p>'
            );
        });
    
        it("contentTag(name, content, options, escape)", () => {
            assert.equal(
                contentTag('p', 'Hello world & all!', {'class': "strong"}, false),
                '<p class="strong">Hello world & all!</p>'
            );
        });
    
        it("contentTag(name, block)", () => {
            assert.equal(
                contentTag('p', () => { return "Hello world&!"; }),
                '<p>Hello world&#38;!</p>'
            );
        });
    
        it("contentTag(name, options, block)", () => {
            assert.equal(
                contentTag('p', {'class': "strong"}, () => { return "Hello world&!"; }),
                '<p class="strong">Hello world&#38;!</p>'
            );
        });
    
        it("contentTag(name, escape, block)", () => {
            assert.equal(
                contentTag('p', false, () => { return "Hello world&!"; }),
                '<p>Hello world&!</p>'
            );
        });
    
        it("contentTag(name, options, escape, block)", () => {
            assert.equal(
                contentTag('p', {'class': "strong"}, false, () => { return "Hello world&!"; }),
                '<p class="strong">Hello world&!</p>'
            );
        });
    });
    
    describe('dataTagOption', () => {
        it("dataTagOption(string, string)", () => {
            assert.equal(dataTagOption("key", "value>"), 'data-key="value>"');
        });

        it("dataTagOption(string, string, true)", () => {
            assert.equal(dataTagOption("key", "value>", true), 'data-key="value&#62;"');
        });

        it("dataTagOption(string, object)", () => {
            assert.equal(dataTagOption("key", { key: "value>" }), 'data-key="{"key":"value>"}"');
        });

        it("dataTagOption(string, object, true)", () => {
            assert.equal(dataTagOption("key", { key: "value>" }, true), 'data-key="{&#34;key&#34;:&#34;value&#62;&#34;}"');
        });
    });

    describe('sanitizeToId', () => {
        it("sanitizeToId(modelName)", () => {
            assert.equal("model_name", sanitizeToId("model[name]"));
        });
    });
    
    describe('tagOption', () => {
        it("tagOption(string, string)", () => {
            assert.equal(tagOption("key", "value>"), 'key="value>"');
        });

        it("tagOption(string, string, false)", () => {
            assert.equal(tagOption("key", "<value>", false), 'key="<value>"');
        });

        it("tagOption(string, string, true)", () => {
            assert.equal(tagOption("key", "<value>", true), 'key="&#60;value&#62;"');
        });

        it("tagOption(string, [string, string])", () => {
            assert.equal(tagOption("key", ['v1', "<v2>"]), 'key="v1 <v2>"');
        });

        it("tagOption(string, [string, string], false)", () => {
            assert.equal(tagOption("key", ['v1', "<v2>"], false), 'key="v1 <v2>"');
        });

        it("tagOption(string, [string, string], true)", () => {
            assert.equal(tagOption("key", ['v1', "<v2>"], true), 'key="v1 &#60;v2&#62;"');
        });
    });

    describe('tagOption', () => {
        it("tagOptions(undefined)", () => {
            assert.equal(tagOptions(undefined), "")
        });

        it('tagOptions({key: "&value", keys: [1, "two>"]})', () => {
            assert.equal(tagOptions({ key: "&value", keys: [1, "two>"] }, true), ' key="&#38;value" keys="1 two&#62;"');
        });

        it('tagOptions({key: null, keys: undefined})', () => {
            assert.equal(tagOptions({ key: null, keys: undefined }), '');
        });

        it('tagOptions({key: "&value", keys: [1, "two>"]}, true)', () => {
            assert.equal(tagOptions({ key: "&value", keys: [1, "two>"] }, true), ' key="&#38;value" keys="1 two&#62;"');
        });

        it('tagOptions({key: "&value", keys: [1, "two>"]}, false)', () => {
            assert.equal(tagOptions({ key: "&value", keys: [1, "two>"] }, false), ' key="&value" keys="1 two>"');
        });

        it('tagOptions({selected: true})', () => {
            assert.equal(tagOptions({ selected: true }), ' selected');
        });
    });
    
    describe('imageTag', () => {
        it("imageTag(src)", () => {
            assert.equal(
                imageTag('/assets/icon.png'), 
                '<img alt="Icon" src="/assets/icon.png">'
            );
        });

        it("imageTag(src, options)", () => {
            assert.equal(
                imageTag('/assets/icon.png', { size : '16x10', alt : 'A caption' }),
                '<img alt="A caption" height="10" src="/assets/icon.png" width="16">'
            );
        });

        it("imageTag(src, options)", () => {
            assert.equal(
                imageTag('/assets/icon.gif', { size : '16' }),
                '<img alt="Icon" height="16" src="/assets/icon.gif" width="16">'
            );
        });

        it("imageTag(src, options)", () => {
            assert.equal(
                imageTag('/icons/icon.gif', { height : '32', width: '32' }),
                '<img alt="Icon" height="32" src="/icons/icon.gif" width="32">'
            );
        });

        it("imageTag(src, options)", () => {
            assert.equal(
                imageTag('/icons/icon.gif', { 'class' : 'menu_icon' }),
                '<img alt="Icon" class="menu_icon" src="/icons/icon.gif">'
            );
        });
    });
    
    describe('buttonTag', () => {
        it("buttonTag()", () => {
            assert.equal(
                buttonTag("Button"),
                '<button type="button">Button</button>'
            );
        });
    
        it("buttonTag(content, options)", () => {
            assert.equal(
                buttonTag("Checkout", {disabled: true}),
                '<button disabled type="button">Checkout</button>'
            );
        });
    
        it("buttonTag(options, block)", () => {
            assert.equal(
                buttonTag({type: "button"}, () => { return "Ask me!"; }),
                '<button type="button">Ask me!</button>'
            );
        });
    });
    
    describe('checkBoxTag', () => {
        it("checkBoxTag(name)", () => {
            assert.equal(
                checkBoxTag('accept'),
                '<input id="accept" name="accept" type="checkbox" value="1">'
            );
        });

        it("checkBoxTag(name, value)", () => {
            assert.equal(
                checkBoxTag('rock', 'rock music'),
                '<input id="rock" name="rock" type="checkbox" value="rock music">'
            );
        });

        it("checkBoxTag(name, value, checked)", () => {
            assert.equal(
                checkBoxTag('receive_email', 'yes', true),
                '<input checked id="receive_email" name="receive_email" type="checkbox" value="yes">'
            );
        });

        it("checkBoxTag(name, value, checked, options)", () => {
            assert.equal(
                checkBoxTag('tos', 'yes', false, { 'class': 'accept_tos' }),
                '<input class="accept_tos" id="tos" name="tos" type="checkbox" value="yes">'
            );
        });
    });
    
    describe('labelTag', () => {
        it("labelTag(content)", () => {
            assert.equal( labelTag("Name"), '<label>Name</label>');
        });
    
        it("labelTag(content, options)", () => {
            assert.equal( labelTag("Name", {'for': "input"}), '<label for="input">Name</label>');
        });
	
        it("labelTag(content, options, escape)", () => {
            assert.equal( labelTag("<Name>", {'for': "input"}, false), '<label for="input"><Name></label>');
        });
    
        it("labelTag(block)", () => {
            assert.equal( labelTag(function() { return "Name"; }), '<label>Name</label>');
        });
        
        it("labelTag(options, block)", () => {
            assert.equal( labelTag({'for': "input"}, () => { return "Name"; }), '<label for="input">Name</label>');
        });
    });
    
    describe('hiddenFieldTag', () => {
        it("hiddenFieldTag(name)", () => {
            assert.equal( hiddenFieldTag('tags_list'), '<input name="tags_list" type="hidden">');
        });
    
        it("hiddenFieldTag(name, value)", () => {
            assert.equal( hiddenFieldTag('token', 'VUBJKB23UIVI1UU1VOBVI@'), '<input name="token" type="hidden" value="VUBJKB23UIVI1UU1VOBVI@">');
        });
    
        it("hiddenFieldTag(name, value, options)", () => {
            assert.equal( hiddenFieldTag('token', 'VUBJKB23UIVI1UU1VOBVI@', {'class': 'mine'}),
                   '<input class="mine" name="token" type="hidden" value="VUBJKB23UIVI1UU1VOBVI@">');
        });
    });
    
    describe('textFieldTag', () => {
        it("textFieldTag(name)", () => {
            assert.equal( textFieldTag('name'),
                   '<input id="name" name="name" type="text">');
        });
    
        it("textFieldTag(name, value)", () => {
            assert.equal( textFieldTag('query', 'search'),
                   '<input id="query" name="query" type="text" value="search">');
        });
    
        it("textFieldTag(name, {placeholder: value})", () => {
            assert.equal( textFieldTag('query', {placeholder: 'search'}),
                   '<input id="query" name="query" placeholder="search" type="text">');
        });
    
        it("textFieldTag(name, {maxlength: 5})", () => {
            assert.equal( textFieldTag('query', {maxlength: 5}),
                   '<input id="query" maxlength="5" name="query" type="text">');
        });
    
        it("textFieldTag(name, options)", () => {
            assert.equal( textFieldTag('query', {'class': 'search'}),
                   '<input class="search" id="query" name="query" type="text">');
        });
    
        it("textFieldTag(name, value, options)", () => {
            assert.equal( textFieldTag('query', '', {size: 75}),
                   '<input id="query" name="query" size="75" type="text" value="">');
        });
    
        it("textFieldTag(name, value, disabled_option)", () => {
            assert.equal( textFieldTag('payment_amount', '$0.00', {disabled: true}),
                   '<input disabled id="payment_amount" name="payment_amount" type="text" value="$0.00">');
        });
    
        it("testFieldTag(name, model)", () => {
            assert.equal( textFieldTag('payment_amount', new Model(), {disabled: true, value: 10}),
                   '<input disabled id="payment_amount" name="payment_amount" type="text" value="10">');
        });
    });
    
    describe('formTag', () => {
        it("formTag()", () => {
            assert.equal(formTag(), "<form>");
        });
    
        it("formTag({action: URL})", () => {
            assert.equal(formTag({action: '/action'}), '<form action="/action" method="post">');
        });
    
        it("formTag({action: URL, method: METHOD})", () => {
            assert.equal(formTag({action: '/action', method: 'get'}), '<form action="/action" method="get">');
        });
    
        it("formTag({action: URL, method: NON_BROWSER_METHOD})", () => {
            assert.equal(formTag({action: '/action', method: 'put'}), '<form action="/action" method="post"><input name="_method" type="hidden" value="put">');
        });
    
        it("formTag({multipart: true})", () => {
            assert.equal(formTag({multipart: true}), '<form enctype="multipart/form-data">');
        });
    
        it("formTag(content)", () => {
            assert.equal(formTag('data'), "<form>data</form>");
        });
    
        it("formTag(emptyContent)", () => {
            assert.equal(formTag(''), "<form></form>");
        });
    
        it("formTag(content, options)", () => {
            assert.equal(formTag('data', {action: '/action', method: 'get'}), '<form action="/action" method="get">data</form>');
        });
    
        it("formTag(contentFunc, options)", () => {
            var contentFunc = function() { return 'data'; };
        
            assert.equal(formTag(contentFunc, {action: '/action', method: 'get'}), '<form action="/action" method="get">data</form>');
        });
    
        it("formTag(options, content)", () => {
            assert.equal(formTag({action: '/action', method: 'get'}, 'data'), '<form action="/action" method="get">data</form>');
        });
    
        it("formTag(options, contentFunc)", () => {
            var contentFunc = function() { return 'data'; };
        
            assert.equal(formTag({action: '/action', method: 'get'}, contentFunc), '<form action="/action" method="get">data</form>');
        });
    
        it("formTag(content, {method: NON_BROWSER_METHOD})", () => {
            assert.equal(formTag('data', {method: 'put'}), '<form method="post"><input name="_method" type="hidden" value="put">data</form>');
        });
    });
    
    describe('submitTag', () => {
        it("submitTag()", () => {
            assert.equal(submitTag(), '<input name="commit" type="submit" value="Save">');
        });

        it("submitTag(value)", () => {
            assert.equal(submitTag("Edit this article"), '<input name="commit" type="submit" value="Edit this article">');
        });

        it("submitTag(value, options)", () => {
            assert.equal(submitTag("Edit", { disabled: true, 'class': 'butn' }), '<input class="butn" disabled name="commit" type="submit" value="Edit">');
        });

        it("submitTag(value)", () => {
            assert.equal(submitTag(null, { 'class': 'btn' }), '<input class="btn" name="commit" type="submit" value="Save">');
        });
    });
    
    describe('numberFieldTag', () => {
        it("numberFieldTag(name)", () => {
            assert.equal(
                numberFieldTag('count'),
                '<input id="count" name="count" type="number">'
            );
        });

        it("numberFieldTag(name, value)", () => {
            assert.equal(
                numberFieldTag('count', 10),
                '<input id="count" name="count" type="number" value="10">'
            );
        });

        it("numberFieldTag(name, value, {min: X, max: Y})", () => {
            assert.equal(
                numberFieldTag('count', 4, {min: 1, max: 9}),
                '<input id="count" max="9" min="1" name="count" type="number" value="4">'
            );
        });

        it("numberFieldTag(name, options)", () => {
            assert.equal(
                numberFieldTag('count', {step: 25}),
                '<input id="count" name="count" step="25" type="number">'
            );
        }); 
    });
    
    describe('radioButtonTag', () => {
        it("radioButtonTag(name, value)", () => {
            assert.equal( radioButtonTag('gender', 'male'), '<input id="gender" name="gender" type="radio" value="male">');
        });

        it("radioButtonTag(name, value, checked)", () => {
            assert.equal( radioButtonTag('gender', 'male', true), '<input checked id="gender" name="gender" type="radio" value="male">');
        });

        it("radioButtonTag(name, value, checked, options)", () => {
            assert.equal( radioButtonTag('gender', 'male', false, {disabled: true}), '<input disabled id="gender" name="gender" type="radio" value="male">');
    
            assert.equal( radioButtonTag('gender', 'male', false, {'class': "myClass"}), '<input class="myClass" id="gender" name="gender" type="radio" value="male">');
        });
    });
    
    describe('passwordFieldTag', () => {
        it("passwordFieldTag()", () => {
            assert.equal(passwordFieldTag(), '<input id="password" name="password" type="password">');
        });

        it("passwordFieldTag(name)", () => {
            assert.equal(passwordFieldTag('pass'), '<input id="pass" name="pass" type="password">');
        });

        it("passwordFieldTag(name, value)", () => {
            assert.equal(passwordFieldTag('pass', 'secret'), '<input id="pass" name="pass" type="password" value="secret">');
        });

        it("passwordFieldTag(name, value, options)", () => {
            assert.equal(passwordFieldTag('pin', '1234', { maxlength: 4, size: 6, 'class': "pin_input" }),
                '<input class="pin_input" id="pin" maxlength="4" name="pin" size="6" type="password" value="1234">');
        });
    });
    
    describe('timeTag', () => {
        it("timeTag(date)", () => {
            var date = new Date(1395441025655);
        
            assert.equal(timeTag(date), '<time datetime="2014-03-21T22:30:25.655Z">'+date.toString()+'</time>');
        });
    
        it("timeTag(date, content)", () => {
            var date = new Date(1395441025655);
        
            assert.equal(timeTag(date, 'Yesterday'), '<time datetime="2014-03-21T22:30:25.655Z">Yesterday</time>');
        });
    
        it("timeTag(date, options, content)", () => {
            var date = new Date(1395441025655);
        
            assert.equal(timeTag(date, {item: 'two'}, 'Yesterday'), '<time datetime="2014-03-21T22:30:25.655Z" item="two">Yesterday</time>');
        });
    
        it("timeTag(date, {pubdate: true})", () => {
            var date = new Date(1395441025655);
        
            assert.equal(timeTag(date, {pubdate: true}), '<time datetime="2014-03-21T22:30:25.655Z" pubdate>'+date.toString()+'</time>');
        });
    
        it("timeTag(date, {datetime: 'myvalue'})", () => {
            var date = new Date(1395441025655);
        
            assert.equal(timeTag(date, {datetime: 'myvalue'}), '<time datetime="myvalue">'+date.toString()+'</time>');
        });

        it("timeTag(date, {format: 'myformat'})", () => {
            var date = new Date(1395441025655);

            assert.equal(timeTag(date, {format: '%Y %m %d'}), '<time datetime="2014-03-21T22:30:25.655Z">2014 03 21</time>');
        });
    
        it("timeTag(date, contentFunc)", () => {
            var date = new Date(1395441025655);
        
            assert.equal(timeTag(date, () => { return 'data'; }), '<time datetime="2014-03-21T22:30:25.655Z">data</time>');
        });
    
        it("timeTag(date, options, contentFunc)", () => {
            var date = new Date(1395441025655);
        
            assert.equal(timeTag(date, {item: 'two'}, () => { return 'data'; }), '<time datetime="2014-03-21T22:30:25.655Z" item="two">data</time>');
        });
    });
    
    describe('textAreaTag', () => {
        it("textAreaTag(name)", () => {
            assert.equal(textAreaTag('post'), '<textarea id="post" name="post"></textarea>');
        });
    
        it("textAreaTag(name, content)", () => {
            assert.equal(textAreaTag('post', 'paragraph'), '<textarea id="post" name="post">paragraph</textarea>');
        });
    
        it("textAreaTag(name, null, {rows: 10, cols: 25})", () => {
            assert.equal(textAreaTag('post', null, {rows: 10, cols: 25}), '<textarea cols="25" id="post" name="post" rows="10"></textarea>');
        });
    
        it("textAreaTag(name, null, {size: '10x25'})", () => {
            assert.equal(textAreaTag('post', null, {size: '10x25'}), '<textarea cols="10" id="post" name="post" rows="25"></textarea>');
        });
    });

    describe('selectTag', () => {
        it("selectTag(name, option_tags)", () => {
            assert.equal( selectTag('people', '<option value="$20">Basic</option>'),
                   '<select id="people" name="people"><option value="$20">Basic</option></select>');
        });
    
        it("selectTag(name, option_tags, options)", () => {
            assert.equal( selectTag("colors", "<option>Red</option><option>Green</option><option>Blue</option>", {multiple: true}),
                   '<select id="colors" multiple name="colors[]"><option>Red</option><option>Green</option><option>Blue</option></select>');
        });
    
        it("selectTag(name, option_tags, {includeBlank: true})", () => {
            assert.equal( selectTag('people', '<option value="$20">Basic</option>', {includeBlank: true}),
                   '<select id="people" name="people"><option value=""></option><option value="$20">Basic</option></select>');
        });
    
        it("selectTag(name, option_tags, {prompt: 'Select somthing'})", () => {
            assert.equal( selectTag('people', '<option value="$20">Basic</option>', {prompt: 'Select somthing'}),
                   '<select id="people" name="people"><option value="">Select somthing</option><option value="$20">Basic</option></select>');
        });
    });
    
    describe('optionsForSelectTag', () => {
        it("optionsForSelectTag(simple_array)", () => {
            assert.equal( optionsForSelectTag(["VISA", "MasterCard"]),
                   "<option>VISA</option>\n<option>MasterCard</option>"
            );
        });
    
        it("optionsForSelectTag(tuple_array)", () => {
            assert.equal( optionsForSelectTag([["Dollar", "$"], ["Kroner", "DKK"]]),
                   '<option value="$">Dollar</option>\n<option value="DKK">Kroner</option>'
            );
        });
    
        it("optionsForSelectTag(hash)", () => {
            assert.equal( optionsForSelectTag({"Dollar": "$", "Kroner": "DKK"}),
                   '<option value="$">Dollar</option>\n<option value="DKK">Kroner</option>'
            );
        });
    
        it("optionsForSelectTag(simple_array, selected)", () => {
            assert.equal( optionsForSelectTag(["VISA", "MasterCard"], 'MasterCard'),
                   "<option>VISA</option>\n<option selected>MasterCard</option>"
            );
        });
    
        it("optionsForSelectTag(tuple_array, selected)", () => {
            assert.equal( optionsForSelectTag([["Dollar", "$"], ["Kroner", "DKK"]], '$'),
                   '<option selected value="$">Dollar</option>\n<option value="DKK">Kroner</option>'
            );
        });
    
        it("optionsForSelectTag(hash, selected)", () => {
            assert.equal( optionsForSelectTag({ "Basic": "$20", "Plus": "$40" }, "$40"),
                   '<option value="$20">Basic</option>\n<option selected value="$40">Plus</option>'
            );
        });
    
        it("optionsForSelectTag(simple_array, multipleSelected)", () => {
            assert.equal( optionsForSelectTag(["VISA", "MasterCard", "Discover"], ['VISA', 'MasterCard']),
                   "<option selected>VISA</option>\n<option selected>MasterCard</option>\n<option>Discover</option>"
            );
        });
    
        it("optionsForSelectTag(tuple_array, multipleSelected)", () => {
            assert.equal( optionsForSelectTag([["Dollar", "$"], ["Kroner", "DKK"], ["Ruble", "RUB"]], ['$', 'RUB']),
                   '<option selected value="$">Dollar</option>\n<option value="DKK">Kroner</option>\n<option selected value="RUB">Ruble</option>'
            );
        });
    
        it("optionsForSelectTag(hash, multipleSelected)", () => {
            assert.equal( optionsForSelectTag({ "Basic": "$20", "Plus": "$40", "Royalty": "$60" }, ["$40", "$60"]),
                   '<option value="$20">Basic</option>\n<option selected value="$40">Plus</option>\n<option selected value="$60">Royalty</option>'
            );
        });
    
        it("optionsForSelectTag(simple_array_with_options)", () => {
            assert.equal( optionsForSelectTag([ "Denmark", ["USA", {'class': 'bold'}], "Sweden" ]),
                   '<option>Denmark</option>\n<option class="bold">USA</option>\n<option>Sweden</option>'
            );
        });
    
        it("optionsForSelectTag(tuple_array_with_options)", () => {
            assert.equal( optionsForSelectTag([["Dollar", "$", {'class':  'underscore'}], ["Kroner", "DKK"]]),
                   '<option class="underscore" value="$">Dollar</option>\n<option value="DKK">Kroner</option>'
            );
        });
    
        it("optionsForSelectTag(simple_array, {disabled: string})", () => {
            assert.equal( optionsForSelectTag(["VISA", "MasterCard", "Discover"], {disabled: 'MasterCard'}),
                   "<option>VISA</option>\n<option disabled>MasterCard</option>\n<option>Discover</option>"
            );
        });
        
        it("optionsForSelectTag(simple_array, {disabled: []})", () => {
            assert.equal( optionsForSelectTag(["VISA", "MasterCard", "Discover"], {disabled: ['VISA', 'MasterCard']}),
                   "<option disabled>VISA</option>\n<option disabled>MasterCard</option>\n<option>Discover</option>"
            );
        });
    
        it("optionsForSelectTag(simple_array, {selected: string, disabled: string})", () => {
            assert.equal( optionsForSelectTag(["VISA", "MasterCard", "Discover"], {selected: 'VISA', disabled: 'MasterCard'}),
                   "<option selected>VISA</option>\n<option disabled>MasterCard</option>\n<option>Discover</option>"
            );
        });
    
        it("optionsForSelectTag(simple_array, {selected: [], disabled: []})", () => {
            assert.equal( optionsForSelectTag(["VISA", "MasterCard", "Discover"], {selected: ['VISA'], disabled: ['MasterCard']}),
                   "<option selected>VISA</option>\n<option disabled>MasterCard</option>\n<option>Discover</option>"
            );
        });
    
        it("optionsForSelectTag(hash, {selected: [], disabled: []})", () => {
            assert.equal( optionsForSelectTag({"VISA": 'V', "MasterCard": "M"}, {selected: ['V'], disabled: ['M']}),
                   '<option selected value="V">VISA</option>\n<option disabled value="M">MasterCard</option>'
            );
        });
    
        it("optionsForSelectTag(simple_array, {selected: func, disabled: func})", () => {
            assert.equal( optionsForSelectTag(["VISA", "MasterCard", "Discover"], {
                       selected: function(v) { return v === 'VISA'; },
                       disabled: function(v) { return v === 'MasterCard'; }
                   }),
                   "<option selected>VISA</option>\n<option disabled>MasterCard</option>\n<option>Discover</option>"
            );
        });
    
        it("optionsForSelectTag(hash, {selected: func, disabled: func})", () => {
            assert.equal( optionsForSelectTag({"VISA": 'V', "MasterCard": "M"}, {
                       selected: function(v) { return v === 'V'; },
                       disabled: function(v) { return v === 'M'; }
                   }),
                   '<option selected value="V">VISA</option>\n<option disabled value="M">MasterCard</option>'
            );
        });
    });
    
    // describe('optionsFromCollectionForSelectTag', () => {
    //     it("optionsFromCollectionForSelectTag(collection, valueAttribute, textAttribute)", () => {
    //         var Model = Viking.Model.extend("model");
    //         var Collection = Viking.Collection.extend({model: Model});
    //
    //         var c = new Collection([{id: 1, name: 'one'}, {id: 2, name: 'two'}, {id: 3, name: 'three'}]);
    //
    //         assert.equal( optionsFromCollectionForSelectTag(c, 'id', 'name'),
    //                '<option value="1">one</option>\n<option value="2">two</option>\n<option value="3">three</option>');
    //     });
    //
    //     it("optionsFromCollectionForSelectTag(collection, valueFunc, textFunc)", () => {
    //         var Model = Viking.Model.extend("model");
    //         var Collection = Viking.Collection.extend({model: Model});
    //
    //         var c = new Collection([{id: 1, name: 'one'}, {id: 2, name: 'two'}, {id: 3, name: 'three'}]);
    //
    //         assert.equal( optionsFromCollectionForSelectTag(c, function(m) { return m.id; }, function(m) { return m.get('name'); }),
    //                '<option value="1">one</option>\n<option value="2">two</option>\n<option value="3">three</option>');
    //     });
    //
    //     it("optionsFromCollectionForSelectTag(collection, valueAttribute, textAttribute, selected)", () => {
    //         var Model = Viking.Model.extend("model");
    //         var Collection = Viking.Collection.extend({model: Model});
    //
    //         var c = new Collection([{id: 1, name: 'one'}, {id: 2, name: 'two'}, {id: 3, name: 'three'}]);
    //
    //         assert.equal( optionsFromCollectionForSelectTag(c, 'id', 'name', 2),
    //                '<option value="1">one</option>\n<option selected value="2">two</option>\n<option value="3">three</option>');
    //     });
    //
    //     it("optionsFromCollectionForSelectTag(collection, valueAttribute, textAttribute, [selected...])", () => {
    //         var Model = Viking.Model.extend("model");
    //         var Collection = Viking.Collection.extend({model: Model});
    //
    //         var c = new Collection([{id: 1, name: 'one'}, {id: 2, name: 'two'}, {id: 3, name: 'three'}]);
    //
    //         assert.equal( optionsFromCollectionForSelectTag(c, 'id', 'name', [2,3]),
    //                '<option value="1">one</option>\n<option selected value="2">two</option>\n<option selected value="3">three</option>');
    //     });
    //
    //     it("optionsFromCollectionForSelectTag(collection, valueAttribute, textAttribute, {selected: ?, disabled: ?})", () => {
    //         var Model = Viking.Model.extend("model");
    //         var Collection = Viking.Collection.extend({model: Model});
    //
    //         var c = new Collection([{id: 1, name: 'one'}, {id: 2, name: 'two'}, {id: 3, name: 'three'}]);
    //
    //         assert.equal( optionsFromCollectionForSelectTag(c, 'id', 'name', {selected: 1, disabled: 3}),
    //                '<option selected value="1">one</option>\n<option value="2">two</option>\n<option disabled value="3">three</option>');
    //     });
    //
    //     it("optionsFromCollectionForSelectTag(collection, valueAttribute, textAttribute, {selected: [?], disabled: [?]})", () => {
    //         var Model = Viking.Model.extend("model");
    //         var Collection = Viking.Collection.extend({model: Model});
    //
    //         var c = new Collection([{id: 1, name: 'one'}, {id: 2, name: 'two'}, {id: 3, name: 'three'}]);
    //
    //         assert.equal( optionsFromCollectionForSelectTag(c, 'id', 'name', {selected: [1], disabled: [3]}),
    //                '<option selected value="1">one</option>\n<option value="2">two</option>\n<option disabled value="3">three</option>');
    //     });
    //
    //     it("optionsFromCollectionForSelectTag(collection, valueAttribute, textAttribute, selectedFunc)", () => {
    //         var Model = Viking.Model.extend("model");
    //         var Collection = Viking.Collection.extend({model: Model});
    //
    //         var c = new Collection([{id: 1, name: 'one'}, {id: 2, name: 'two'}, {id: 3, name: 'three'}]);
    //
    //         assert.equal( optionsFromCollectionForSelectTag(c, 'id', 'name', function(m) { return m === 1; }),
    //                '<option selected value="1">one</option>\n<option value="2">two</option>\n<option value="3">three</option>');
    //     });
    //
    //     it("optionsFromCollectionForSelectTag(collection, valueAttribute, textAttribute, {selected: selectedFunc, disabled: disabledFunc})", () => {
    //         var Model = Viking.Model.extend("model");
    //         var Collection = Viking.Collection.extend({model: Model});
    //
    //         var c = new Collection([{id: 1, name: 'one'}, {id: 2, name: 'two'}, {id: 3, name: 'three'}]);
    //
    //         assert.equal( optionsFromCollectionForSelectTag(c, 'id', 'name', {
    //                    selected: function(m) { return m === 1; },
    //                    disabled: function(m) { return m === 3; }}),
    //                '<option selected value="1">one</option>\n<option value="2">two</option>\n<option disabled value="3">three</option>');
    //     });
    // });
});