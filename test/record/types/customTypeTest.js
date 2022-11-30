import 'mocha';
import * as assert from 'assert';
import JSONType from 'viking/record/types/json';
import Record from 'viking/record';
import Types from 'viking/record/types';


describe('Viking.Record.Types', () => {
    
    describe('custom', () => {
        
        Types.registry.length = {
            load: (value, key, changes, record, typeSettings) => {
                const units = changes[typeSettings.units_key] || record.attributes[typeSettings.units_key]
                if (!units) {
                    return false
                }
                if (typeof value != "object") value = {
                    value,
                    units
                }

                changes[key] = value
                changes[typeSettings.units_key] = value.units
                
                return true
            },
            dump: (v, key) => {
                return v.value
            }
        }
    
        class Foo extends Record {
            static schema = {
                foo_width: {type: 'length', units_key: 'foo_width_units'}
            }
        }

        it("init", () => {
            const record = new Foo({
                foo_width: 9,
                foo_width_units: 'ft'
            })
            
            assert.deepEqual({
                value: 9,
                units: 'ft'
            }, record.foo_width);
        });
        
        it("setting attribute", () => {
            const record = new Foo({
                foo_width: 9,
                foo_width_units: 'ft'
            })
            
            record.foo_width = {
                value: 3,
                units: 'm'
            }
            
            assert.equal(3, record.foo_width.value)
            assert.equal('m', record.readAttribute('foo_width_units'))
        });
        
        it("asJSON", () => {
            const record = new Foo({
                foo_width: 9,
                foo_width_units: 'ft'
            })
            
            record.foo_width = {
                value: 3,
                units: 'm'
            }
            
            assert.deepEqual({
                foo_width: 3,
                foo_width_units: 'm'
            }, record.asJSON())
        });

    });
});