import assert from 'assert';
import Record from 'viking/record';

describe('Viking.Record.Types', () => {
    
    describe('custom', () => {
    
        class Foo extends Record {
            static schema = {
                value: {
                    type: (attributes, record={}) => {
                        return attributes.type || record.readAttribute('type')
                    }
                }
            }
        }

        it("init", () => {
            // Integer from Integer
            let record = new Foo({ type: 'integer', value: 9 })
            assert.deepEqual(9, record.value);
            
            // Integer from String
            record = new Foo({ type: 'integer', value: "9" })
            assert.deepEqual(9, record.value);

            // String from Integer
            record = new Foo({ type: 'string',  value: 9 })
            assert.deepEqual('9', record.value);
            
            // String from Boolean
            record = new Foo({ type: 'string',  value: true })
            assert.deepEqual('true', record.value);

            // Boolean from Boolean
            record = new Foo({ type: 'boolean', value: true })
            assert.deepEqual(true, record.value);
            
            record = new Foo({ type: 'boolean', value: false })
            assert.deepEqual(false, record.value);

            // Boolean from Integer
            record = new Foo({ type: 'boolean', value: 9 })
            assert.deepEqual(true, record.value);
            
            // Boolean from null
            record = new Foo({ type: 'boolean', value: null })
            assert.deepEqual(null, record.value);
            
            // Date from String
            record = new Foo({ type: 'date', value: '2013-04-10' })
            assert.deepEqual(new Date(1365552000000).valueOf(), record.value.valueOf()+(new Date().getTimezoneOffset()*60*1000));
        });
        
        it("setting attribute", () => {
            const record = new Foo({ type: 'string', value: 9 })
            record.value = 3
            
            assert.deepEqual('3', record.value);
        });

        it("asJSON", () => {
            const record = new Foo({ type: 'string', value: 9 })
            assert.deepEqual({ type: 'string', value: '9' }, record.asJSON())
        });

    });
});