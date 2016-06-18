import Viking from '../../../../src/viking';

(function () {
    module("Viking.Model#updateAttribute");

    test("#updateAttribute(key, data) calls #updateAttributes", function() {
        expect(2);
        
        var model = new Viking.Model();
        model.updateAttributes = function (data, options) {
            deepEqual(data, {key: 'value'});
            equal(undefined, options);
        }
        
        model.updateAttribute('key', 'value');        
    });
    
    test("#updateAttribute(key, data, options) calls #updateAttributes", function() {
        expect(2);
        
        var model = new Viking.Model();
        model.updateAttributes = function (data, options) {
            deepEqual(data, {key: 'value'});
            deepEqual(options, {option: 'key'});
        }
        
        model.updateAttribute('key', 'value', {option: 'key'});
    });

}());