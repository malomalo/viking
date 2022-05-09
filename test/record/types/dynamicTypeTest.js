import 'mocha';
import * as assert from 'assert';
import VikingRecord from 'viking/record';
import Types from 'viking/record/types';

describe('Viking.Record.Types', () => {
    describe('Dynamic', () => {
        
        class Trait extends VikingRecord {
            static schema = {
                value_type: {type: "string"},
                value: {
                    type: (value, attrs) => {
                        return Types.registry[attrs.value_type].load(value)
                    }
                }
            }
        }

        it("type: function()", function() {
            let trait = new Trait({ value_type: 'boolean', value: 'true' })
            assert.equal(trait.value, true);
            
            trait = new Trait({ value_type: 'string', value: 'true' })
            assert.equal(trait.value, 'true');
            
            trait = new Trait({ value_type: 'integer', value: '123' })
            assert.equal(trait.value, 123);
            
            trait = new Trait({ value_type: 'date', value: "2013-04-10" })
            assert.equal(trait.value.valueOf(), new Date(1365570000000).valueOf());
        });
    });
});