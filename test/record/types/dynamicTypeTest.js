import 'mocha';
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
            let record = new Foo({
                type: 'integer',
                value: 9
            })
            assert.deepEqual(9, record.value);
            
            record = new Foo({
                value: 9,
                type: 'string'
            })
            assert.deepEqual('9', record.value);
            
            record = new Foo({
                type: 'boolean',
                value: 9
            })
            assert.deepEqual(true, record.value);
        });
        
        it("setting attribute", () => {
            const record = new Foo({
                value: 9,
                type: 'string'
            })

            record.value = 3
            assert.deepEqual('3', record.value);
        });

        it("asJSON", () => {
            const record = new Foo({
                value: 9,
                type: 'string'
            })

            assert.deepEqual({
                type: 'string',
                value: '9'
            }, record.asJSON())
        });

    });
});