import * as assert from 'assert';
import 'mocha';
import {Model as VikingModel} from '../../../src/viking/model';

describe('Viking.Model#setAttributes', () => {

    describe('coercion', () => {
        class Model extends VikingModel {
            static schema = {
                key: {type: 'number', array: true},
                date: {type: 'date'},
                number: {type: 'number'},
                string: {type: 'string'},
                unkown: {type: 'anUnkownType'}
            };
        }

        it('supports arrays', () => {

        });

        describe('array', () => {
            let a = new Model();

            a.setAttributes({key: [10, '10.5']});
            assert.deepEqual(a.readAttribute('key'), [10, 10.5]);

            a.setAttributes({key: ['10.5']});
            assert.deepEqual(a.readAttribute('key'), [10.5]);
        });

        describe('boolean', () => {

        });

        describe('date', () => {
            it("iso8601 string to date", () => {
                let a = new Model();

                a.setAttributes({date: "2013-04-10T21:24:28+00:00"});
                assert.equal(a.readAttribute('date').valueOf(), new Date(1365629068000).valueOf());
            });

            it("int(milliseconds since epoch) to date", () => {
                let a = new Model();

                a.setAttributes({date: 1365629126097});
                assert.equal(a.readAttribute('date').valueOf(), new Date(1365629126097).valueOf());
            });
        });

        describe('number', () => {
            it("string to number", () => {
                let a = new Model();

                a.setAttributes({number: '10'});
                assert.equal(a.readAttribute('number'), 10);

                a.setAttributes({number: '10.5'});
                assert.equal(a.readAttribute('number'), 10.5);
            });
        });

        describe('json', () => {
            // // coercing JSON ----------------------------------------------------------
            // test("#coerceAttributes coerces {} to Viking.Model", function() {
            //     let Model = Viking.Model.extend({ schema: {
            //         key: {type: 'json'}
            //     }});
            //     var a = new Model();

            //     assert.ok(a.coerceAttributes({key: {}}).key instanceof Viking.Model);
            //     assert.deepEqual(a.coerceAttributes({key: {}}).key.attributes, {});
            //     assert.deepEqual(a.coerceAttributes({key: {key: 'value'}}).key.attributes, {key: 'value'});
            // });

            // test("#coerceAttributes coerces {} to Viking.Model and sets the modelName", function() {
            //     let Model = Viking.Model.extend({ schema: {
            //         key: {type: 'json'}
            //     }});
            //     var a = new Model();

            //     assert.deepEqual(a.coerceAttributes({key: {}}).key.modelName.name, 'Key');
            // });


            // test("#coerceAttributes thows error when can't coerce value", function() {
            //     let Model = Viking.Model.extend({ schema: {
            //         date: {type: 'date'}
            //     }});
            //     var a = new Model();

            //     assert.throws(function() { a.coerceAttributes({date: true}) }, TypeError);

            //     try {
            //         a.coerceAttributes({date: true})
            //     } catch (e) {
            //         assert.equal(e.message, "boolean can't be coerced into Date");
            //     }
            // });
        });

        describe('string', () => {
            it("boolean to string", () => {
                let a = new Model();
                a.setAttributes({string: true});
                assert.equal(a.readAttribute('string'), 'true');

                a.setAttributes({string: false});
                assert.equal(a.readAttribute('string'), 'false');
            });

            it("number to string", () => {
                let a = new Model();

                a.setAttributes({string: 10});
                assert.equal(a.readAttribute('string'), '10');

                a.setAttributes({string: 10.5});
                assert.equal(a.readAttribute('string'), '10.5');
            });

            it("null to null", () => {
                let a = new Model();

                a.setAttributes({string: null});
                assert.equal(a.readAttribute('string'), null);
            });
        });

        it("thows error on unkown data type", () => {
            let a = new Model();

            assert.throws(() => { a.setAttributes({unkown: true}); }, TypeError);

            try {
                a.setAttributes({unkown: true});
            } catch (e) {
                assert.equal(e.message, "Coercion of anUnkownType unsupported");
            }
        });
    });

    it('set an empty string', () => {
        let model = new VikingModel({name: 'Model'});
        model.setAttributes({name: ''});
        assert.equal(model.readAttribute('name'), '');
    });

    it('setting an object', () => {
        let counter = 0;
        let model = new VikingModel({
            custom: {foo: 1}
        });

        model.addEventListener('change', () => { counter++; });
        model.setAttributes({
            custom: {foo: 1} // no change should be fired
        });
        model.setAttributes({
            custom: {foo: 2} // change event should be fired
        });
        assert.equal(counter, 1);
    });

    it('set and unset', () => {
        let a = new VikingModel({id: 'id', foo: 1, bar: 2, baz: 3});
        let changeCount = 0;
        a.addEventListener('change:foo', () => { changeCount += 1; });
        a.setAttributes({foo: 2});
        assert.equal(a.readAttribute('foo'), 2, 'Foo should have changed.');
        assert.equal(changeCount, 1, 'Change count should have incremented.');

        // set with value that is not new shouldn't fire change event
        a.setAttributes({foo: 2});
        assert.equal(a.readAttribute('foo'), 2, 'Foo should NOT have changed, still 2');
        assert.equal(changeCount, 1, 'Change count should NOT have incremented.');

        // a.validate = function(attrs) {
        //     assert.equal(attrs.foo, void 0, 'validate:true passed while unsetting');
        // };
        // a.unset('foo', {validate: true});
        // assert.equal(a.get('foo'), void 0, 'Foo should have changed');
        // delete a.validate;
        // assert.equal(changeCount, 2, 'Change count should have incremented for unset.');

        // a.unset('id');
        // assert.equal(a.id, undefined, 'Unsetting the id should remove the id property.');
    });


});