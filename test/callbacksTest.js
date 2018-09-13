import 'mocha';
import * as assert from 'assert';
import CallbacksMixin from 'viking/support/callbacks';

var Callbacks = CallbacksMixin(Object);

describe('Viking.Callbacks', () => {
    
    it('before callback', () => {
        class CB extends Callbacks {
            sequence = [];
            
            test() { this.sequence.push(2); }
        }
        
        let obj = new CB();
        obj.addCallback('before', 'test', function () {
            this.sequence.push(1);
        });
        obj.test();
        assert.deepStrictEqual(obj.sequence, [1,2]);
    });
    
    it('around callback', () => {
        class CB extends Callbacks {
            sequence = [];
            
            test() { this.sequence.push(2); }
        }
        
        let obj = new CB();
        obj.addCallback('around', 'test', function (cb) {
            this.sequence.push(1);
            cb();
            this.sequence.push(3);
        });
        obj.test();
        assert.deepStrictEqual(obj.sequence, [1,2,3]);
    });

    it('after callback', () => {
        class CB extends Callbacks {
            sequence = [];
            
            test() { this.sequence.push(1); }
        }
        
        let obj = new CB();
        obj.addCallback('after', 'test', function () {
            this.sequence.push(2);
        });
        obj.test();
        assert.deepStrictEqual(obj.sequence, [1,2]);
    });
    
});