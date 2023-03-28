import * as assert from 'assert';
import {toParam, toQuery, deepAssign} from '@malomalo/viking/support/object';

describe('VikingSupport.Object', () => {

    it('#toParam()', () => {
        assert.equal('1=2013&2=myString&3=true&4&5=false', toParam({1: 2013, 2: 'myString', 3: true, 4: null, 5: false}));
    });

    it('#toParam(namespace)', () => {
        assert.equal('namespace%5B1%5D=2013&namespace%5B2%5D=myString&namespace%5B3%5D=true&namespace%5B4%5D&namespace%5B5%5D=false',
              toParam({1: 2013, 2: 'myString', 3: true, 4: null, 5: false}, 'namespace'));
    });

    it('#toQuery is an alias for #toParam', () => {
        assert.strictEqual(toParam, toQuery);
    });
    
    it('#deepAssign', () => {
        assert.deepEqual(deepAssign({test: 1}, {test: 2}), {test: 2});
        assert.deepEqual(deepAssign({test: 1}, {test: 2}, {test: 3}), {test: 3});
        assert.deepEqual(deepAssign({
            a: 2,
            b: {
                test: 1,
                test2: 2
            }
        }, {
            c: 3,
            b: {
                test: 2,
                test3: 3
            }
        }), {
            a: 2,
            b: {
                test: 2,
                test2: 2,
                test3: 3
            },
            c: 3
        });
    });

});
