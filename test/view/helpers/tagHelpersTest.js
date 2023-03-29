import * as assert from 'assert';
import {assert_tag} from '../../testHelper.js'
import Model from '@malomalo/viking/record';
import {
    addErrorClassToOptions,
    contentTag,
    sanitizeToId,
    tagNameForModelAttribute,
    tag,
    imageTag, buttonTag, checkBoxTag, labelTag, formTag, hiddenFieldTag, textFieldTag,
    submitTag, numberFieldTag, radioButtonTag, passwordFieldTag, timeTag, textAreaTag,
    selectTag, optionsFromCollectionForSelectTag, optionsForSelectTag
} from '@malomalo/viking/view/helpers/tagHelpers';

describe('Helpers.tagHelpers', () => {

    describe('tag', () => {
        it("tag(name)", () => {
            let t = tag("br");

            assert_tag(tag('br'), 'br');
        });

        it("tag(name, options)", () => {
            let t = tag("input", {type: 'text'});

            assert_tag(t, 'input', {type: 'text'});
        });

        it("tag(name, options) escaping", () => {
            assert_tag(
                tag("img", {src: "open & shut.png"}),
                'img', { src: 'open & shut.png' }
            )

            assert_tag(
                tag("img", {src: "open &#38; shut.png"}),
                'img', { src: 'open &#38; shut.png' }
            )
        });

        it("tag(name, boolean_options)", () => {
            assert_tag(
                tag("input", {selected: true}),
                'input', { selected: true }
            )
        });

        it("tag(name, data_options)", () => {
            assert_tag(
                tag("div", {data: {name: 'Stephen', city_state: ["Chicago", "IL"]}}),
                'div', {
                    "data-name": 'Stephen',
                    "data-city_state": '["Chicago","IL"]'
                }
            )
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
            assert_tag(
                contentTag('p', 'Hello world & all!'),
                'p', 'Hello world &amp; all!'
            )
        });

        it("contentTag(name, content, options)", () => {
            assert_tag(
                contentTag('p', 'Hello world & all!', {'class': "strong"}),
                'p', {"class": "strong"}, 'Hello world &amp; all!'
            );
        });

        it("contentTag(name, block)", () => {
            assert_tag(
                contentTag('p', () => { return "Hello world&!"; }),
                'p', 'Hello world&amp;!'
            );
        });

        it("contentTag(name, options, block)", () => {
            assert_tag(
                contentTag('p', {'class': "strong"}, () => { return "Hello world&!"; }),
                'p', {"class": "strong"}, 'Hello world&amp;!'
            );
        });
    });

    describe('data Options', () => {
        it("tag(string, object)", () => {
            assert_tag(
                tag("p", {data: {"key": "value>"}}),
                'p', { "data-key": 'value>' }
            )
        });
    });

    describe('sanitizeToId', () => {
        it("sanitizeToId(modelName)", () => {
            assert.equal("model_name", sanitizeToId("model[name]"));
        });
    });

    describe('tag Options', () => {
        it("tag(string, {key: string})", () => {
            assert_tag(
                tag("p", {key: "value>"}),
                'p', { "key": 'value>' }
            );
        });

        it("tag(string, {key: [string, string]})", () => {
            assert_tag(
                tag('p', {key: ['v1', "<v2>"]}),
                'p', { "key": 'v1 <v2>' }
            );
        });

        it("tag(string, {key: undefined})", () => {
            assert_tag(
                tag('p', {key: undefined}),
                'p'
            );
        });

        it("tag(string, {key: null})", () => {
            assert_tag(
                tag('p', {key: null}),
                'p'
            );
        });

        it("tag(string, {booleanKey: true})", () => {
            assert_tag(
                tag('p', {selected: true}),
                'p', { "selected": '' }
            );
        });
    });

    describe('imageTag', () => {
        it("imageTag(src)", () => {
            assert_tag(
                imageTag('/assets/icon.png'),
                'img', { "src": '/assets/icon.png' }
            );
        });

        it("imageTag(src, {size: 'XxY'})", () => {
            assert_tag(
                imageTag('/assets/icon.png', { size : '16x10', alt : 'A caption' }),
                'img', { alt: "A caption", height: "10", src: "/assets/icon.png", width: "16" }
            );
        });

        it("imageTag(src, {size: 'X'})", () => {
            assert_tag(
                imageTag('/assets/icon.gif', { size : '16' }),
                'img', { alt: "Icon", height: "16", src: "/assets/icon.gif", width: "16" }
            );
        });

        it("imageTag(src, options)", () => {
            assert_tag(
                imageTag('/icons/icon.gif', { height : '32', width: '31' }),
                'img', { alt: "Icon", height: "32", src: "/icons/icon.gif", width: "31" }
            );
        });

        it("imageTag(src, options)", () => {
            assert_tag(
                imageTag('/icons/icon.gif', { 'class' : 'menu_icon' }),
                'img', { alt: "Icon", class: "menu_icon", src: "/icons/icon.gif"}
            );
        });
    });

    describe('buttonTag', () => {
        it("buttonTag()", () => {
            assert_tag(
                buttonTag("Button"),
                'button', {type: 'button'}, 'Button'
            );
        });

        it("buttonTag(content, options)", () => {
            assert_tag(
                buttonTag("Checkout", {disabled: true}),
                'button', {type: 'button', disabled: ''}, 'Checkout'
            );
        });

        it("buttonTag(options, block)", () => {
            assert_tag(
                buttonTag({type: "button"}, () => { return "Ask me!"; }),
                'button', {type: 'button'}, 'Ask me!'
            );
        });
    });

    describe('checkBoxTag', () => {
        it("checkBoxTag(name)", () => {
            assert_tag(
                checkBoxTag('accept'),
                'input', {id: 'accept', name: 'accept', type: 'checkbox', value: '1'}
            );
        });

        it("checkBoxTag(name, value)", () => {
            assert_tag(
                checkBoxTag('rock', 'rock music'),
                'input', {id: 'rock', name: 'rock', type: 'checkbox', value: 'rock music'}
            );
        });

        it("checkBoxTag(name, value, checked)", () => {
            assert_tag(
                checkBoxTag('receive_email', 'yes', true),
                'input', {id: 'receive_email', name: 'receive_email', type: 'checkbox', value: 'yes', checked: ''}
            );
        });

        it("checkBoxTag(name, value, checked, options)", () => {
            assert_tag(
                checkBoxTag('tos', 'yes', false, { 'class': 'accept_tos' }),
                'input', {id: 'tos', name: 'tos', type: 'checkbox', value: 'yes', class: 'accept_tos'}
            );
        });
    });

    describe('labelTag', () => {
        it("labelTag(content)", () => {
            assert_tag(
                labelTag("Name"),
                'label', 'Name'
            );
        });

        it("labelTag(content, options)", () => {
            assert_tag(
                labelTag("Name", {'for': "input"}),
                'label', {'for': 'input'}, 'Name'
            );
        });

        it("labelTag(block)", () => {
            assert_tag(
                labelTag(function() { return "Name"; }),
                'label', 'Name'
            );
        });

        it("labelTag(options, block)", () => {
            assert_tag(
                labelTag({'for': "input"}, () => { return "Name"; }),
                'label', {'for': 'input'}, 'Name'
            );
        });
    });

    describe('hiddenFieldTag', () => {
        it("hiddenFieldTag(name)", () => {
            assert_tag(
                hiddenFieldTag('tags_list'),
                'input', {'name': 'tags_list', type: 'hidden'}
            );
        });

        it("hiddenFieldTag(name, value)", () => {
            assert_tag(
                hiddenFieldTag('token', 'VUBJKB23UIVI1UU1VOBVI@'),
                'input', {'name': 'token', type: 'hidden', value: 'VUBJKB23UIVI1UU1VOBVI@'}
            );
        });

        it("hiddenFieldTag(name, value, options)", () => {
            assert_tag(
                hiddenFieldTag('token', 'VUBJKB23UIVI1UU1VOBVI@', {'class': 'mine'}),
                'input', {'name': 'token', type: 'hidden', value: 'VUBJKB23UIVI1UU1VOBVI@', "class": 'mine'}
            );
        });
    });

    describe('textFieldTag', () => {
        it("textFieldTag(name)", () => {
            assert_tag(
                textFieldTag('name'),
                'input', {id: 'name', name: 'name', type: 'text'}
            );
        });

        it("textFieldTag(name, value)", () => {
            assert_tag(
                textFieldTag('query', 'search'),
                'input', {id: 'query', name: 'query', type: 'text', value: 'search'}
            );
        });

        it("textFieldTag(name, {placeholder: value})", () => {
            assert_tag(
                textFieldTag('query', {placeholder: 'search'}),
                'input', {id: 'query', name: 'query', type: 'text', placeholder: 'search'}
            );
        });

        it("textFieldTag(name, {maxlength: 5})", () => {
            assert_tag(
                textFieldTag('query', {maxlength: 5}),
                'input', {id: 'query', name: 'query', type: 'text', maxlength: '5'}
            );
        });

        it("textFieldTag(name, options)", () => {
            assert_tag(
                textFieldTag('query', {'class': 'search'}),
                'input', {id: 'query', name: 'query', type: 'text', class: 'search'}
            );
        });

        it("textFieldTag(name, value, options)", () => {
            assert_tag(
                textFieldTag('query', '', {size: 75}),
                'input', {id: 'query', name: 'query', type: 'text', size: '75', value: ''}
            );
        });

        it("textFieldTag(name, value, disabled_option)", () => {
            assert_tag(
                textFieldTag('payment_amount', '$0.00', {disabled: true}),
                'input', {id: 'payment_amount', name: 'payment_amount', type: 'text', disabled: '', value: '$0.00'}
            );
        });

        it("textFieldTag(name, model)", () => {
            assert_tag(
                textFieldTag('payment_amount', new Model(), {disabled: true, value: 10}),
                'input', {id: 'payment_amount', name: 'payment_amount', type: 'text', disabled: '', value: '10'}
            );
        });
    });

    describe('formTag', () => {
        it("formTag()", () => {
            assert_tag( formTag(), "form" );
        });

        it("formTag({action: URL})", () => {
            assert_tag(
                formTag({action: '/action'}),
                "form", {action: '/action', method: 'post'}
            );
        });

        it("formTag({action: URL, method: METHOD})", () => {
            assert_tag(
                formTag({action: '/action', method: 'get'}),
                "form", {action: '/action', method: 'get'}
            );
        });

        it("formTag({action: URL, method: NON_BROWSER_METHOD})", () => {
            assert_tag(
                formTag({action: '/action', method: 'put'}),
                "form", {action: '/action', method: 'post'},
                '<input type="hidden" name="_method" value="put">'
            );
        });

        it("formTag({multipart: true})", () => {
            assert_tag(
                formTag({multipart: true}),
                "form", {enctype: 'multipart/form-data'}
            );
        });

        it("formTag(content)", () => {
            assert_tag(
                formTag('data'),
                "form", {}, 'data'
            );
        });

        it("formTag(emptyContent)", () => {
            assert_tag(
                formTag(''),
                "form", {}, ''
            );
        });

        it("formTag(content, options)", () => {
            assert_tag(
                formTag('data', {action: '/action', method: 'get'}),
                "form", {action: '/action', method: 'get'}, 'data'
            );
        });

        it("formTag(contentFunc, options)", () => {
            var contentFunc = function() { return 'data'; };

            assert_tag(
                formTag(contentFunc, {action: '/action', method: 'get'}),
                "form", {action: '/action', method: 'get'}, 'data'
            );
        });

        it("formTag(options, content)", () => {
            assert_tag(
                formTag({action: '/action', method: 'get'}, 'data'),
                "form", {action: '/action', method: 'get'}, 'data'
            );
        });

        it("formTag(options, contentFunc)", () => {
            var contentFunc = function() { return 'data'; };

            assert_tag(
                formTag({action: '/action', method: 'get'}, contentFunc),
                "form", {action: '/action', method: 'get'}, 'data'
            );
        });

        it("formTag(content, {method: NON_BROWSER_METHOD})", () => {
            assert_tag(
                formTag('data', {method: 'put'}),
                "form", {method: 'post'},
                '<input type="hidden" name="_method" value="put">data'
            );
        });
    });

    describe('submitTag', () => {
        it("submitTag()", () => {
            assert_tag(
                submitTag(),
                'input', {name: 'commit', type: 'submit', value: 'Save'}
            );
        });

        it("submitTag(value)", () => {
            assert_tag(
                submitTag("Edit this article"),
                'input', {name: 'commit', type: 'submit', value: 'Edit this article'}
            );
        });

        it("submitTag(value, options)", () => {
            assert_tag(
                submitTag("Edit", { disabled: true, 'class': 'butn' }),
                'input', {class: 'butn', disabled: '', name: 'commit', type: 'submit', value: 'Edit'}
            );
        });

        it("submitTag(null, options)", () => {
            assert_tag(
                submitTag(null, { 'class': 'btn' }),
                'input', {class: 'btn', name: 'commit', type: 'submit', value: 'Save'}
            );
        });
    });

    describe('numberFieldTag', () => {
        it("numberFieldTag(name)", () => {
            assert_tag(
                numberFieldTag('count'),
                'input', {id: "count", name: "count", type: "number"}
            );
        });

        it("numberFieldTag(name, value)", () => {
            assert_tag(
                numberFieldTag('count', 10),
                'input', {id: "count", name: "count", type: "number", value: '10'}
            );
        });

        it("numberFieldTag(name, value, {min: X, max: Y})", () => {
            assert_tag(
                numberFieldTag('count', 4, {min: 1, max: 9}),
                'input', {id: "count", name: "count", type: "number", value: '4', min: '1', max: '9'}
            );
        });

        it("numberFieldTag(name, options)", () => {
            assert_tag(
                numberFieldTag('count', {step: 25}),
                'input', {id: "count", name: "count", type: "number", step: '25'}
            );
        });
    });

    describe('radioButtonTag', () => {
        it("radioButtonTag(name, value)", () => {
            assert_tag(
                radioButtonTag('gender', 'male'),
                'input', {id: "gender", name: "gender", type: "radio", value: 'male'}
            );
        });

        it("radioButtonTag(name, value, checked)", () => {
            assert_tag(
                radioButtonTag('gender', 'male', true),
                'input', {id: "gender", name: "gender", type: "radio", value: 'male', checked: ''}
            );
        });

        it("radioButtonTag(name, value, checked, options)", () => {
            assert_tag(
                radioButtonTag('gender', 'male', false, {disabled: true}),
                'input', {id: "gender", name: "gender", type: "radio", value: 'male', disabled: ''}
            );

            assert_tag(
                radioButtonTag('gender', 'male', false, {'class': "myClass"}),
                'input', {id: "gender", name: "gender", type: "radio", value: 'male', class: 'myClass'}
            );
        });
    });

    describe('passwordFieldTag', () => {
        it("passwordFieldTag()", () => {
            assert_tag(
                passwordFieldTag(),
                'input', {id: 'password', name: 'password', type: 'password'}
            );
        });

        it("passwordFieldTag(name)", () => {
            assert_tag(
                passwordFieldTag('pass'),
                'input', {id: 'pass', name: 'pass', type: 'password'}
            );
        });

        it("passwordFieldTag(name, value)", () => {
            assert_tag(
                passwordFieldTag('pass', 'secret'),
                'input', {id: 'pass', name: 'pass', type: 'password', value: 'secret'}
            );
        });

        it("passwordFieldTag(name, value, options)", () => {
            assert_tag(
                passwordFieldTag('pin', '1234', { maxlength: 4, size: 6, 'class': "pin_input" }),
                'input', {id: 'pin', name: 'pin', type: 'password', value: '1234', maxlength: '4', size: '6', class: 'pin_input'}
            );
        });
    });

    describe('timeTag', () => {
        it("timeTag(date)", () => {
            var date = new Date(1395441025655);

            assert_tag(
                timeTag(date),
                'time', {datetime: "2014-03-21T22:30:25.655Z"}, date.toString()
            );
        });

        it("timeTag(date, content)", () => {
            var date = new Date(1395441025655);

            assert_tag(
                timeTag(date, 'Yesterday'),
                'time', {datetime: "2014-03-21T22:30:25.655Z"}, 'Yesterday'
            );
        });

        it("timeTag(date, options, content)", () => {
            var date = new Date(1395441025655);

            assert_tag(
                timeTag(date, {item: 'two'}, 'Yesterday'),
                'time', {datetime: "2014-03-21T22:30:25.655Z", item: 'two'}, 'Yesterday'
            );
        });

        it("timeTag(date, {pubdate: true})", () => {
            var date = new Date(1395441025655);

            assert_tag(
                timeTag(date, {pubdate: true}),
                'time', {datetime: "2014-03-21T22:30:25.655Z", pubdate: ''}, date.toString()
            );
        });

        it("timeTag(date, {datetime: 'myvalue'})", () => {
            var date = new Date(1395441025655);

            assert_tag(
                timeTag(date, {datetime: 'myvalue'}),
                'time', {datetime: "myvalue"}, date.toString()
            );
        });

        it("timeTag(date, {format: 'myformat'})"
            // var date = new Date(1395441025655);
            //
            // assert_tag(
            //     timeTag(date, {format: '%Y %m %d'}),
            //     'time', {datetime: "2014-03-21T22:30:25.655Z"}, '2014 03 21'
            // );
        );

        it("timeTag(date, contentFunc)", () => {
            var date = new Date(1395441025655);

            assert_tag(
                timeTag(date, () => { return 'data'; }),
                'time', {datetime: "2014-03-21T22:30:25.655Z"}, 'data'
            );
        });

        it("timeTag(date, options, contentFunc)", () => {
            var date = new Date(1395441025655);

            assert_tag(
                timeTag(date, {item: 'two'}, () => { return 'data'; }),
                'time', {datetime: "2014-03-21T22:30:25.655Z", item: 'two'}, 'data'
            );
        });
    });

    describe('textAreaTag', () => {
        it("textAreaTag(name)", () => {
            assert_tag(
                textAreaTag('post'),
                'textarea', {id: 'post', name: 'post'}, ''
            );
        });

        it("textAreaTag(name, content)", () => {
            assert_tag(
                textAreaTag('post', 'paragraph'),
                'textarea', {id: 'post', name: 'post'}, 'paragraph'
            );
        });

        it("textAreaTag(name, null, {rows: 10, cols: 25})", () => {
            assert_tag(
                textAreaTag('post', null, {rows: 10, cols: 25}),
                'textarea', {id: 'post', name: 'post', cols: '25', rows: '10'}, ''
            );
        });

        it("textAreaTag(name, null, {size: '10x25'})", () => {
            assert_tag(
                textAreaTag('post', null, {size: '10x25'}),
                'textarea', {id: 'post', name: 'post', cols: '10', rows: '25'}, ''
            );
        });
    });

    // describe('selectTag', () => {
    //     it("selectTag(name, option_tags)", () => {
    //         assert_tag(
    //             selectTag('people', '<option value="$20">Basic</option>'),
    //             'select', {id: 'people', name: 'people'}, '<option value="$20">Basic</option>'
    //         );
    //     });
    //
    //     it("selectTag(name, option_tags, options)", () => {
    //         assert.equal( selectTag("colors", "<option>Red</option><option>Green</option><option>Blue</option>", {multiple: true}),
    //                '<select id="colors" multiple name="colors[]"><option>Red</option><option>Green</option><option>Blue</option></select>');
    //     });
    //
    //     it("selectTag(name, option_tags, {includeBlank: true})", () => {
    //         assert.equal( selectTag('people', '<option value="$20">Basic</option>', {includeBlank: true}),
    //                '<select id="people" name="people"><option value=""></option><option value="$20">Basic</option></select>');
    //     });
    //
    //     it("selectTag(name, option_tags, {prompt: 'Select somthing'})", () => {
    //         assert.equal( selectTag('people', '<option value="$20">Basic</option>', {prompt: 'Select somthing'}),
    //                '<select id="people" name="people"><option value="">Select somthing</option><option value="$20">Basic</option></select>');
    //     });
    // });

    describe('optionsForSelectTag', () => {
        it("optionsForSelectTag(simple_array)", () => {
            var tags = optionsForSelectTag(["VISA", "MasterCard"]);
            assert_tag( tags[0], 'option', {}, 'VISA' );
            assert_tag( tags[1], 'option', {}, 'MasterCard' );
        });

        it("optionsForSelectTag(tuple_array)", () => {
            var tags = optionsForSelectTag([["Dollar", "$"], ["Kroner", "DKK"]]);
            assert_tag( tags[0], 'option', {value: '$'}, 'Dollar' );
            assert_tag( tags[1], 'option', {value: 'DKK'}, 'Kroner' );
        });

        it("optionsForSelectTag(hash)", () => {
            var tags = optionsForSelectTag({"Dollar": "$", "Kroner": "DKK"});
            assert_tag( tags[0], 'option', {value: '$'}, 'Dollar' );
            assert_tag( tags[1], 'option', {value: 'DKK'}, 'Kroner' );
        });

        it("optionsForSelectTag(simple_array, selected)", () => {
            var tags = optionsForSelectTag(["VISA", "MasterCard"], 'MasterCard');
            assert_tag( tags[0], 'option', {}, 'VISA' );
            assert_tag( tags[1], 'option', {selected: ''}, 'MasterCard' );
        });

        it("optionsForSelectTag(tuple_array, selected)", () => {
            var tags = optionsForSelectTag([["Dollar", "$"], ["Kroner", "DKK"]], '$');
            assert_tag( tags[0], 'option', {value: '$', selected: ''}, 'Dollar' );
            assert_tag( tags[1], 'option', {value: 'DKK'}, 'Kroner' );
        });

        it("optionsForSelectTag(hash, selected)", () => {
            var tags = optionsForSelectTag({ "Basic": "$20", "Plus": "$40" }, "$40");
            assert_tag( tags[0], 'option', {value: '$20'}, 'Basic' );
            assert_tag( tags[1], 'option', {value: '$40', selected: ''}, 'Plus' );
        });

        it("optionsForSelectTag(simple_array, multipleSelected)", () => {
            var tags = optionsForSelectTag(["VISA", "MasterCard", "Discover"], ['VISA', 'MasterCard']);
            assert_tag( tags[0], 'option', {selected: ''}, 'VISA' );
            assert_tag( tags[1], 'option', {selected: ''}, 'MasterCard' );
            assert_tag( tags[2], 'option', {}, 'Discover' );
        });

        it("optionsForSelectTag(tuple_array, multipleSelected)", () => {
            var tags = optionsForSelectTag([["Dollar", "$"], ["Kroner", "DKK"], ["Ruble", "RUB"]], ['$', 'RUB']);
            assert_tag( tags[0], 'option', {value: '$', selected: ''}, 'Dollar' );
            assert_tag( tags[1], 'option', {value: 'DKK'}, 'Kroner' );
            assert_tag( tags[2], 'option', {value: 'RUB', selected: ''}, 'Ruble' );
        });

        it("optionsForSelectTag(hash, multipleSelected)", () => {
            var tags = optionsForSelectTag({ "Basic": "$20", "Plus": "$40", "Royalty": "$60" }, ["$40", "$60"]);
            assert_tag( tags[0], 'option', {value: '$20'}, 'Basic' );
            assert_tag( tags[1], 'option', {value: '$40', selected: ''}, 'Plus' );
            assert_tag( tags[2], 'option', {value: '$60', selected: ''}, 'Royalty' );
        });

        it("optionsForSelectTag(simple_array_with_options)", () => {
            var tags = optionsForSelectTag([ "Denmark", ["USA", {'class': 'bold'}], "Sweden" ]);
            assert_tag( tags[0], 'option', {}, 'Denmark' );
            assert_tag( tags[1], 'option', {class: 'bold'}, 'USA' );
            assert_tag( tags[2], 'option', {}, 'Sweden' );
        });

        it("optionsForSelectTag(tuple_array_with_options)", () => {
            var tags = optionsForSelectTag([["Dollar", "$", {'class':  'underscore'}], ["Kroner", "DKK"]]);
            assert_tag( tags[0], 'option', {value: '$', class: 'underscore'}, 'Dollar' );
            assert_tag( tags[1], 'option', {value: 'DKK'}, 'Kroner' );
        });

        it("optionsForSelectTag(simple_array, {disabled: string})", () => {
            var tags = optionsForSelectTag(["VISA", "MasterCard", "Discover"], {disabled: 'MasterCard'});
            assert_tag( tags[0], 'option', {}, 'VISA' );
            assert_tag( tags[1], 'option', {disabled: ''}, 'MasterCard' );
            assert_tag( tags[2], 'option', {}, 'Discover' );
        });

        it("optionsForSelectTag(simple_array, {disabled: []})", () => {
            var tags = optionsForSelectTag(["VISA", "MasterCard", "Discover"], {disabled: ['VISA', 'MasterCard']});
            assert_tag( tags[0], 'option', {disabled: ''}, 'VISA' );
            assert_tag( tags[1], 'option', {disabled: ''}, 'MasterCard' );
            assert_tag( tags[2], 'option', {}, 'Discover' );
        });

        it("optionsForSelectTag(simple_array, {selected: string, disabled: string})", () => {
            var tags = optionsForSelectTag(["VISA", "MasterCard", "Discover"], {selected: 'VISA', disabled: 'MasterCard'});
            assert_tag( tags[0], 'option', {selected: ''}, 'VISA' );
            assert_tag( tags[1], 'option', {disabled: ''}, 'MasterCard' );
            assert_tag( tags[2], 'option', {}, 'Discover' );
        });

        it("optionsForSelectTag(simple_array, {selected: [], disabled: []})", () => {
            var tags = optionsForSelectTag(["VISA", "MasterCard", "Discover"], {selected: ['VISA'], disabled: ['MasterCard']});
            assert_tag( tags[0], 'option', {selected: ''}, 'VISA' );
            assert_tag( tags[1], 'option', {disabled: ''}, 'MasterCard' );
            assert_tag( tags[2], 'option', {}, 'Discover' );
        });

        it("optionsForSelectTag(hash, {selected: [], disabled: []})", () => {
            var tags = optionsForSelectTag({"VISA": 'V', "MasterCard": "M"}, {selected: ['V'], disabled: ['M']});
            assert_tag( tags[0], 'option', {value: 'V', selected: ''}, 'VISA' );
            assert_tag( tags[1], 'option', {value: 'M', disabled: ''}, 'MasterCard' );
        });

        it("optionsForSelectTag(simple_array, {selected: func, disabled: func})", () => {
            var tags = optionsForSelectTag(["VISA", "MasterCard", "Discover"], {
                selected: function(v) { return v === 'VISA'; },
                disabled: function(v) { return v === 'MasterCard'; }
            });

            assert_tag( tags[0], 'option', {selected: ''}, 'VISA' );
            assert_tag( tags[1], 'option', {disabled: ''}, 'MasterCard' );
            assert_tag( tags[2], 'option', {}, 'Discover' );
        });

        it("optionsForSelectTag(hash, {selected: func, disabled: func})", () => {
            var tags = optionsForSelectTag({"VISA": 'V', "MasterCard": "M", "Discover": "D"}, {
                selected: function(v) { return v === 'V'; },
                disabled: function(v) { return v === 'M'; }
            });

            assert_tag( tags[0], 'option', {value: 'V', selected: ''}, 'VISA' );
            assert_tag( tags[1], 'option', {value: 'M', disabled: ''}, 'MasterCard' );
            assert_tag( tags[2], 'option', {value: "D"}, 'Discover' );
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