import 'mocha';
import * as assert from 'assert';
import JSONType from 'viking/record/types/json';
import Record from 'viking/record';
import Types from 'viking/record/types';


describe('Viking.Record.Types', () => {
    
    describe('custom', () => {
        Types.registry.duration = {
            load: (value, key, schema, attrs) => {
                return {
                    value: value,
                    units: 'milliseconds'
                }
            },
            dump: (v, key, schema, attrs) => {
                return v.value + " " + v.units
            }
        }
    
        class Foo extends Record {
            static schema = {
                job_length: {type: 'duration'}
            }
        }

        it("init", () => {
            const record = new Foo({
                job_length: 9000,
            })
            
            assert.deepEqual({
                value: 9000,
                units: 'milliseconds'
            }, record.job_length);
        });
        
        it("asJSON", () => {
            const record = new Foo({
                job_length: 9000,
            })
            
            record.job_length.value = 9
            record.job_length.units = 'minutes'
            
            assert.deepEqual({
                job_length: "9 minutes"
            }, record.asJSON())
        });
        
        it("setAttribute", () => {
            const record = new Foo({
                job_length: 9,
            })
            
            record.job_length = 8000
            
            assert.deepEqual({
                job_length: "8000 milliseconds"
            }, record.asJSON())
        });
    })
    
    describe('custom with depends_on', () => {
        
        Types.registry.length = {
            depends_on: schema => {
                return schema.units_key
            },
            load: (value, key, schema, attrs) => {
                if (typeof value == "object") return value
                return {
                    value: value,
                    units: attrs[schema.units_key]
                }
            },
            dump: (v, key, schema, attrs) => {
                attrs[schema.units_key] = v.units
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
        
        it("asJSON", () => {
            const record = new Foo({
                foo_width: 9,
                foo_width_units: 'ft'
            })
            
            record.foo_width.value = 3
            record.foo_width.units = 'm'
            
            assert.deepEqual({
                foo_width: 3,
                foo_width_units: 'm'
            }, record.asJSON())
        });
        
        it("setAttribute", () => {
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
        
        it("depends_on is string", () => {
            Types.registry.area = {
                depends_on: 'area_units',
                load: (value, key, schema, attrs) => {
                    if (typeof value == "object") return value
                    return {
                        value: value,
                        units: attrs.area_units
                    }
                },
                dump: (v, key, schema, attrs) => {
                    attrs.area_units = v.units
                    return v.value
                }
            }
            class Bar extends Record {
                static schema = {
                    bar_area: {type: 'area'}
                }
            }
            const record = new Bar({
                bar_area: 9,
                area_units: 'ft'
            })
            assert.deepEqual({
                value: 9,
                units: 'ft'
            }, record.bar_area);
        });

    });
});