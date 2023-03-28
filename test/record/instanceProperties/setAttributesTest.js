import * as assert from 'assert';
import VikingRecord from '@malomalo/viking/record';

describe('Viking.Record#setAttributes', () => {
    class Model extends VikingRecord {
        static schema = {
            key:        {type: 'integer', array: true},
            date:       {type: 'date'},
            datetime:       {type: 'datetime'},
            float:      {type: 'float'},
            integer:    {type: 'integer'},
            string:     {type: 'string'},
            boolean:    {type: 'boolean'},
            unkown:     {type: 'anUnkownType'}
        };
    }
    describe('coercion', () => {
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

                a.setAttributes({date: "2013-04-10"});
                assert.equal(a.readAttribute('date').valueOf(), new Date(2013, 3, 10).valueOf());
                
                a.setAttributes({date: "2013-04-11"});
                assert.equal(a.readAttribute('date').valueOf(), new Date(2013, 3, 11).valueOf());
            });

            it("int(milliseconds since epoch) to date", () => {
                let a = new Model();

                a.setAttributes({date: 1365570000000});
                assert.equal(a.readAttribute('date').valueOf(), new Date(1365570000000).valueOf());
            });
        });
        
        describe('datetime', () => {
            it("iso8601 string to datetime", () => {
                let a = new Model();

                a.setAttributes({datetime: "2013-04-10T21:24:28+00:00"});
                assert.equal(a.readAttribute('datetime').valueOf(), new Date(1365629068000).valueOf());
            });

            it("int(milliseconds since epoch) to datetime", () => {
                let a = new Model();

                a.setAttributes({datetime: 1365629126097});
                assert.equal(a.readAttribute('datetime').valueOf(), new Date(1365629126097).valueOf());
            });
        });

        describe('integer', () => {
            it("string to integer", () => {
                let a = new Model();

                a.setAttributes({integer: '10'});
                assert.equal(a.readAttribute('integer'), 10);
            });
        });

        describe('float', () => {
            it("string to float", () => {
                let a = new Model();

                a.setAttributes({float: '10.5'});
                assert.equal(a.readAttribute('float'), 10.5);
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
    
    it('set falsy value', () => {
        let model = new Model();
        model.setAttributes({integer: 0, boolean: false, string: ''})
        assert.deepEqual(model.changes(), {
            integer: [null, 0],
            boolean: [null, false],
            string: [null, '']
        })
    })
    
    it('set non-falsy to falsy value', () => {
        let model = new Model({
            integer: 1,
            boolean: true,
            string: 'test'
        });
        model.setAttributes({integer: 0, boolean: false, string: ''})
        assert.deepEqual(model.changes(), {
            integer: [null, 0],
            boolean: [null, false],
            string: [null, '']
        })
    })

    it('set an empty string', () => {
        let model = new VikingRecord({name: 'Model'});
        model.setAttributes({name: ''});
        assert.equal(model.readAttribute('name'), '');
    });

    it('setting an object', () => {
        let counter = 0;
        let model = new VikingRecord({
            custom: {foo: 1}
        });

        model.addEventListener('changed', () => { counter++; });
        model.setAttributes({
            custom: {foo: 1} // no change should be fired
        });
        model.setAttributes({
            custom: {foo: 2} // change event should be fired
        });
        assert.equal(counter, 1);
    });

    it('set and unset', () => {
        let a = new VikingRecord({id: 'id', foo: 1, bar: 2, baz: 3});
        let changeCount = 0;
        a.addEventListener('changed:foo', () => { changeCount += 1; });
        a.setAttributes({foo: 2});
        assert.equal(a.readAttribute('foo'), 2, 'Foo should have changed.');
        assert.equal(changeCount, 1, 'Change count should have incremented.');

        // set with value that is not new shouldn't fire change event
        a.setAttributes({foo: 2});
        assert.equal(a.readAttribute('foo'), 2, 'Foo should NOT have changed, still 2');
        assert.equal(changeCount, 1, 'Change count should NOT have incremented.');
    });

});